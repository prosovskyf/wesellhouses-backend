/**
* A module with defined api endpoints for managing users
* @module routes/agents
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/user' });
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body')({ multipart: true, formidable: { uploadDir: './public' } })
const fs = require('fs');

/** Load other modules */
const { validateAgentUpdate } = require('../controllers/validation')
const auth = require('../controllers/auth')
const agent = require('../models/agents');
const crypt = require('../helpers/crypt')
const can = require('../permissions/agents')

/** Route endpoints */
router.get('/profile', auth, viewUser);
router.put('/updateinfo', auth, bodyParser(), validateAgentUpdate, changeInfo);
router.put('/changepass', auth, bodyParser(), changePass);
router.put('/avatar', auth, koaBody, uploadAvatar);
router.del('/avatar', auth, deleteAvatar);

/**
 * Function to view user profile. 
 * It loads agentid from context state, get profile from database, checks permissions
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - user data, string - message, integer - http status
 */
async function viewUser(ctx) {
    let agentId = ctx.state.user.agentid

    let data = await agent.viewAgent(agentId);
    let permission = can.read(ctx.state.user, data[0]);
    if (permission.granted) {
        try {
            let result = await agent.viewAgent(agentId);
            if (result.length > 0) {
                ctx.status = 200;
                ctx.body = result;
            }
            else {
                ctx.status = 404;
            }
        }
        catch (e) {
            ctx.status = 500;
            ctx.body = 'Error occured, try again'
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
 * Function to update user profile. 
 * It loads agentid from context state, get profile from database, 
 * checks permissions and update user profile
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - user data, string - message, integer - http status
 */
async function changeInfo(ctx) {
    let agentId = ctx.state.user.agentid
    let data = await agent.viewAgent(agentId);
    let permission = can.update(ctx.state.user, data[0]);
    if (permission.granted) {
        let updatedInfo = ctx.request.body
        try {
            let obj = await agent.updateAgent(agentId, updatedInfo);
            ctx.status = 201;
            ctx.body = obj;
        }
        catch (error) {
            ctx.status = 400;
            ctx.body = 'You submitted wrong values or you missing some, please check and try again';
        }
    }
    else {
        ctx.status = 403
    }
}

/**
 * Function to change user password
 * It loads agentid from context state, get profile from database, checks permissions. 
 * After that it will get data from body (current pass, new password), verify current pass for match.
 * If matches, it will check strength of new pass and hash it.
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function changePass(ctx) {
    let agentId = ctx.state.user.agentid
    let data = await agent.viewAgent(agentId);
    let permission = can.update(ctx.state.user, data[0]);
    if (permission.granted) {
        let userSecret = ctx.request.body;
        let user = ctx.state.user.user
        try {
            if (await agent.verifySecret(user, userSecret.currentPassword)) {
                if (await crypt.validatePassword(userSecret.newPassword)) {
                    let secrets = await crypt.hashSecret(userSecret.newPassword);
                    await agent.updatePassword(agentId, secrets.password, secrets.passwordsalt);
                    ctx.status = 200;
                    ctx.body = 'Password changed, you will be redirected to log in!';
                }
                else {
                    ctx.status = 400;
                    ctx.body = 'Please follow requirements for new password - 8chars, Upper case, lower case, special char, num';
                }
            }
            else {
                ctx.status = 403;
                ctx.body = 'Wrong current password';
            }
        }
        catch (e) {
            ctx.status = 500;
            ctx.body = 'An error occured';
        }
    }
    else {
        ctx.status = 403;
        ctx.body = 'You are not authorized to perform this operation on this profile'
    }
}

/**
 * Function to upload user avatar
 * It loads agentid and username from context state, get profile from database, checks permissions. 
 * After that it will get files data and start upload.
 * Will create new folder for user avatar if one exists and move it there, then store path to DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - category ID, string - message, integer - http status
 */
async function uploadAvatar(ctx) {
    let agentId = ctx.state.user.agentid
    let user = ctx.state.user.user
    let data = await agent.viewAgent(agentId);
    let permission = can.update(ctx.state.user, data[0]);
    if (permission.granted) {
        try {
            const { path } = ctx.request.files.avatar
            let newAvatarName = 'agent_' + user + '.' + 'png';
            let dir = `./public/avatars/`
            let newPath = `./public/avatars/${newAvatarName}`;
            if (!fs.existsSync(dir, { recursive: true })) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.renameSync(path, newPath);
            let result = await agent.uploadPicturePath(newPath, agentId);
            ctx.status = 200
            ctx.body = result
        }
        catch (err) {
            ctx.status = 500
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
  * Function to delete user avatar
  * It loads agentid and username from context state, get profile from database, checks permissions. 
  * After that it will delete the file/folder and path from DB
  * @param {object} ctx - Koa req/res context object
  * @returns {integer | string} string - message, integer - http status
  */
async function deleteAvatar(ctx) {
    let agentId = ctx.state.user.agentid
    let user = ctx.state.user.user
    let data = await agent.viewAgent(agentId);
    let permission = can.delete(ctx.state.user, data[0]);
    if (permission.granted) {
        try {
            let toDelete = `./public/avatars/agent_${user}.png`;
            let delDir = `./public/avatars`;
            fs.unlinkSync(toDelete)
            fs.rmdirSync(delDir)
            await agent.deletePicturePath(agentId)
            ctx.status = 200
            ctx.body = 'Picture deleted!'
        }
        catch (err) {
            ctx.status = 500
        }
    }
    else {
        ctx.status = 403;
    }
}

module.exports = router;