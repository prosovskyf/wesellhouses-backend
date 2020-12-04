/**
* A module with defined api endpoints for managing messaging system
* @module routes/messages
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/messages' });
const bodyParser = require('koa-bodyparser');

/** Load other modules */
const auth = require('../controllers/auth')
const { validateMessage, validateFirstMessage } = require('../controllers/validation')
const messages = require('../models/messages');
const properties = require('../models/properties');
const agents = require('../models/agents');
const can = require('../permissions/messages');

/** Route endpoints */
router.get('/', auth, getThreads);
router.post('/', auth, bodyParser(), validateFirstMessage, sendFirstMessage);
router.get('/:id([0-9]{1,})', auth, getMessages);
router.post('/:id([0-9]{1,})', auth, bodyParser(), validateMessage, sendMessage);
router.del('/:id([0-9]{1,})', auth, deleteThread);
router.put('/:id([0-9]{1,})/archive', auth, archiveThread);
router.get('/archive', auth, getArchivedThreads);
router.get('/archive/:id([0-9]{1,})', auth, getArchivedMessages);
router.put('/archive/:id([0-9]{1,})', auth, unArchiveThread);

/**
 * Function to create thread and first message
 * Subject is generated based on property title
 * Message is encrypted and stored in DB
 * If thread exists, return error that user already contacted agent for this property
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function sendFirstMessage(ctx) {
    let message = ctx.request.body.message;
    let property_id = ctx.request.body.property_id;
    let user = ctx.state.user.user
    try {
        let p = (await properties.getById(property_id))[0];
        let agent = (await agents.viewAgent(p.agent_id))[0].username;
        let thread = await messages.getThreadByProperty(p.id, agent, user)
        if (thread.length > 0) {
            ctx.status = 400;
            ctx.body = 'You already messaged to agent, access your messages in Messages tab'
        }
        else {
            let subject = 'Message for property: ' + p.title;
            let threadId = await messages.createThread(subject, p.id, agent, user)
            let result = await messages.sendMessage(message, threadId[0].id, user);
            await messages.updateLastMessageTime(result[0].date)
            if (result.length > 0) {
                ctx.status = 201;
                ctx.body = 'Message was sent successfully, you can access your conversations in Messages tab';
            }
            else {
                ctx.status = 400;
                ctx.body = 'Please check your input and try again'
            }
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Problem occured, try again';
    }
}

/**
 * Function to send message to specific thread
 * Message is encrypted and stored in DB
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function sendMessage(ctx) {
    let thread = ctx.params.id
    let author = ctx.state.user.user
    let message = ctx.request.body.message
    try {
        let info = await messages.getThread(thread);
        let permissions = await can.send(ctx.state.user, info[0]);
        if (permissions.granted) {
            let result = await messages.sendMessage(message, thread, author);
            await messages.updateLastMessageTime(result[0].date, thread)
            if (result.length > 0) {
                ctx.status = 201;
                ctx.body = 'Message was sent successfully';
            }
            else {
                ctx.status = 400;
                ctx.body = 'Please check your input and try again'
            }
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Problem occured, try again';
    }
}

/**
 * Function to get threads for specific user
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - thread, string - message, integer - http status
 */
async function getThreads(ctx) {
    let user = ctx.state.user.user
    let role = ctx.state.user.role

    try {
        if (role === 'user') {
            let result = await messages.getThreadsUser(user);
            if (result.length > 0) {
                let permissions = await can.readThreads(ctx.state.user, result[0])
                if (permissions.granted) {
                    ctx.status = 200;
                    ctx.body = result;
                }
            }
            else {
                ctx.status = 404;
                ctx.body = 'No conversations';
            }
        }
        else if (role === 'agent') {
            let result = await messages.getThreadsAgent(user);
            if (result.length > 0) {
                let permissions = await can.readThreads(ctx.state.user, result[0])
                if (permissions.granted) {
                    ctx.status = 200;
                    ctx.body = result;
                }
            }
            else {
                ctx.status = 404;
                ctx.body = 'No conversations';
            }
        }
        else {
            ctx.status = 400;
            ctx.body = 'Bad request'
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to get messages for specific user and thread
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - thread and messages, string - message, integer - http status
 */
async function getMessages(ctx) {
    let user = ctx.state.user.user
    let thread = ctx.params.id
    let role = ctx.state.user.role
    try {
        let t = await messages.getThread(thread);
        if ((t.length > 0) && (t[0]['archived_' + role] === false) && (t[0]['del_for_' + role] === false)) {
            let permissions = await can.readMessages(ctx.state.user, t[0])
            if (permissions.granted) {
                let msgs;
                if (role === 'user') {
                    msgs = await messages.getMessages(thread, t[0].agent_name, user)
                }
                else {
                    msgs = await messages.getMessages(thread, user, t[0].user_name)
                }
                if (msgs.length > 0) {
                    ctx.status = 200;
                    ctx.body = {
                        thread: t[0],
                        messages: msgs
                    }
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No messages';
                }
            }
        }
        else {
            ctx.status = 404;
            ctx.body = 'Conversation does not exists'
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to get archived messages for specific user and thread
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - thread and messages, string - message, integer - http status
 */
async function getArchivedMessages(ctx) {
    let user = ctx.state.user.user
    let thread = ctx.params.id
    let role = ctx.state.user.role
    try {
        let t = await messages.getThread(thread);
        if ((t.length > 0) && (t[0]['archived_' + role] === true) && (t[0]['del_for_' + role] === false)) {
            let permissions = await can.readMessages(ctx.state.user, t[0])
            if (permissions.granted) {
                let msgs;
                if (role === 'user') {
                    msgs = await messages.getMessages(thread, t[0].agent_name, user)
                }
                else {
                    msgs = await messages.getMessages(thread, user, t[0].user_name)
                }
                if (msgs.length > 0) {
                    ctx.status = 200;
                    ctx.body = {
                        thread: t[0],
                        messages: msgs
                    }
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No messages';
                }
            }
        }
        else {
            ctx.status = 404;
            ctx.body = 'Conversation does not exists'
        }
    }
    catch (e) {
        ctx.status = 400;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to archive specific thread for user by role
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function archiveThread(ctx) {
    let user = ctx.state.user.user
    let role = ctx.state.user.role
    let thread = ctx.params.id
    try {
        let info = await messages.getThread(thread);
        let permissions = can.update(ctx.state.user, info[0]);
        if (permissions.granted) {
            if (role === 'user') {
                let result = await messages.archiveThreadUser(thread, user);
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was archived.';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No conversation found to archive';
                }
            }
            else if (role === 'agent') {
                let result = await messages.archiveThreadAgent(thread, user);
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was archived.';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No conversation found to archive';
                }
            }
            else {
                ctx.status = 400;
                ctx.body = 'Bad request'
            }
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to un-archive specific thread for user by role
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function unArchiveThread(ctx) {
    let user = ctx.state.user.user
    let role = ctx.state.user.role
    let thread = ctx.params.id
    try {
        let info = await messages.getThread(thread);
        let permissions = can.update(ctx.state.user, info[0]);
        if (permissions.granted) {
            if (role === 'user') {
                let result = await messages.unArchiveThreadUser(thread, user);
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was removed from archive.';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'Conversation not found in archive';
                }
            }
            else if (role === 'agent') {
                let result = await messages.unArchiveThreadAgent(thread, user);
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was removed from archive.';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'Conversation not found in archive';
                }
            }
            else {
                ctx.status = 400;
                ctx.body = 'Bad request'
            }
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to get archived threads for specific user
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - thread, string - message, integer - http status
 */
async function getArchivedThreads(ctx) {
    let user = ctx.state.user.user
    let role = ctx.state.user.role
    try {
        if (role === 'user') {
            let result = await messages.getArchivedThreadsUser(user);
            if (result.length > 0) {
                let permissions = await can.readThreads(ctx.state.user, result[0])
                if (permissions.granted) {
                    ctx.status = 200;
                    ctx.body = result;
                }
            }
            else {
                ctx.status = 404;
                ctx.body = 'No messages';
            }
        }
        else if (role === 'agent') {
            let result = await messages.getArchivedThreadsAgent(user);
            if (result.length > 0) {
                let permissions = await can.readThreads(ctx.state.user, result[0])
                if (permissions.granted) {
                    ctx.status = 200;
                    ctx.body = result;
                }
            }
            else {
                ctx.status = 404;
                ctx.body = 'No messages';
            }
        }
        else {
            ctx.status = 400;
            ctx.body = 'Bad request'
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

/**
 * Function to delete specific thread for user by role
 * Thread is deleted from DB if both agent and user mark it for deletion
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteThread(ctx) {
    let user = ctx.state.user.user
    let role = ctx.state.user.role
    let thread = ctx.params.id
    try {
        let info = await messages.getThread(thread);
        let permissions = can.delete(ctx.state.user, info[0]);
        if (permissions.granted) {
            if (role === 'user') {
                let result = await messages.delThreadUser(thread, user);
                let info = (await messages.getThread(thread))[0];
                if ((info.del_for_user === true) && (info.del_for_agent === true)) {
                    await messages.deleteThreadAndMessages(thread)
                }
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was deleted';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No conversation found to be deleted';
                }
            }
            else if (role === 'agent') {
                let result = await messages.delThreadAgent(thread, user);
                let info = (await messages.getThread(thread))[0];
                if ((info.del_for_user === true) && (info.del_for_agent === true)) {
                    await messages.deleteThreadAndMessages(thread)
                }
                if (result.length > 0) {
                    ctx.status = 200;
                    ctx.body = 'Conversation was deleted';
                }
                else {
                    ctx.status = 404;
                    ctx.body = 'No conversation found to be deleted';
                }
            }
            else {
                ctx.status = 400;
                ctx.body = 'Bad request'
            }
        }
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = 'Error occured, try again'
    }
}

module.exports = router;

