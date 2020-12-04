/**
* A module with defined api endpoints for sign up process
* @module routes/signup
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const router = Router({ prefix: '/api/v1/signup' });

/** Load other modules */
const { validateAgent } = require('../controllers/validation')
const agent = require('../models/signup');
const crypt = require('../helpers/crypt')
const verification = require('../models/verification')


/** Route endpoints */
router.post('/', bodyParser(), validateAgent, signup);

/**
 * Function to sign up user
 * Checks if signup code is present in body and decide which role will be assigned to user
 * Checks username and email are not present and validate username, password and email
 * Hash supplied password, generate sign up token 
 * Store hashed pass and token with expiration date to DB and send activation link to email
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function signup(ctx) {
    let userData = ctx.request.body;
    try {
        var role;
        if (userData.code) {
            if (await agent.compareSecret(userData.code)) {
                role = 'agent'
            }
            else {
                return (
                    ctx.status = 401,
                    ctx.body = 'Wrong sign up code'
                )
            }
        }
        else {
            role = 'user'
        }
        let username = await agent.getUsername(userData.username);
        if (username.length === 0) {
            if ((userData.email !== "") && (userData.password !== "") && (userData.username !== "")) {
                let email = await agent.getEmail(userData.email);
                if (email.length === 0) {
                    if ((await crypt.validateEmail(userData.email)) &&
                        (await crypt.validatePassword(userData.password)) &&
                        (userData.username.length > 5)) {
                        let secrets = await crypt.hashSecret(userData.password);
                        delete userData.password;
                        delete userData.code;
                        userData = Object.assign(userData, secrets);
                        let token = await crypt.gen();
                        var expire = new Date()
                        expire.setHours(expire.getHours() + 48)
                        await agent.signupAgent(userData, role, token, expire);
                        await verification.sendVerification(userData.email, userData.username, token);
                        ctx.status = 200;
                        ctx.body = 'You signed-up successfully, verify your email in 48 hours to activate your account';
                    }
                    else {
                        ctx.status = 400;
                        ctx.body = 'Check entered values for email, password or username';
                    }
                }
                else {
                    ctx.status = 400;
                    ctx.body = 'This email is not available.'
                }
            }
            else {
                ctx.status = 400;
                ctx.body = 'Please enter all required values'
            }
        }
        else {
            ctx.status = 400;
            ctx.body = 'This username already exists';
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'An error occured';
    }
}

module.exports = router;