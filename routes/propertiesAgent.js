/**
* A module with defined api endpoints for managing properties by agents
* @module routes/propertiesAgent
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/admin/properties' });
const bodyParser = require('koa-bodyparser');

/** Load other modules */
const { validateProperty } = require('../controllers/validation')
const property = require('../models/propertiesAgent.js');
const auth = require('../controllers/auth')
const can = require('../permissions/propertiesAgent')
const fs = require('fs');


/** Route endpoints */
router.get('/', auth, getAllByAgent);
router.get('/:id([0-9]{1,})', auth, getById);
router.get('/hot', auth, getHighPriority);
router.post('/', auth, bodyParser(), validateProperty, createProperty);
router.put('/:id([0-9]{1,})', auth, bodyParser(), validateProperty, updateProperty);
router.del('/:id([0-9]{1,})', auth, deleteProperty);

/**
 * Function to get agent's properties based on supplied filter in query
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - properties, string - message, integer - http status
 */
async function getAllByAgent(ctx) {
    let { order = "created", direction = 'ASC', features = '', category = '' } = ctx.request.query;
    let agentId = ctx.state.user.agentid
    let data = await property.getAllByAgent(order, direction, features, category, agentId);
    if (data.length > 0) {
        let permission = can.read(ctx.state.user, data[0])
        if (permission.granted) {
            ctx.status = 200;
            ctx.body = data;
        }
        else {
            ctx.status = 403;
        }
    }
    else {
        ctx.status = 404;
        ctx.body = 'You have not created any property yet or they do not match your filter'
    }
}

/**
 * Function to get agent's properties marked as high priority
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - properties, string - message, integer - http status
 */
async function getHighPriority(ctx) {
    let agentId = ctx.state.user.agentid
    let data = await property.getHighPriority(agentId);
    if (data.length > 0) {
        let permission = can.read(ctx.state.user, data[0])
        if (permission.granted) {
            ctx.status = 200;
            ctx.body = data;
        }
        else {
            ctx.status = 403;
        }
    }
    else {
        ctx.status = 404;
        ctx.body = 'No High priority items found'
    }
}

/**
 * Function to get agent's property by ID 
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - property, string - message, integer - http status
 */
async function getById(ctx) {
    let agentId = ctx.state.user.agentid
    let id = ctx.params.id;
    let data = await property.getById(id, agentId);
    if ((id > 0) && (!isNaN(id)) && (data.length > 0)) {
        let permission = can.read(ctx.state.user, data[0])
        if (permission.granted) {
            ctx.status = 200;
            ctx.body = data;
        }
        else {
            ctx.status = 403;
        }
    }
    else {
        ctx.status = 404;
    }
}

/**
 * Function to create new property
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - property, string - message, integer - http status
 */
async function createProperty(ctx) {
    let permission = can.create(ctx.state.user)
    if (permission.granted) {
        try {
            let newProperty = ctx.request.body;
            let agentId = ctx.state.user.agentid
            let obj = await property.createProperty(newProperty, agentId);
            ctx.status = 201;
            ctx.body = obj;
        }
        catch (e) {
            ctx.status = 400;
            ctx.body = 'You submitted wrong values or you missing some, please check and try again';
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
 * Function to update agent's property by ID
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - property, string - message, integer - http status
 */
async function updateProperty(ctx) {
    let id = ctx.params.id;
    let agentId = ctx.state.user.agentid
    let data = await property.getById(id, agentId);
    if ((id > 0) && (data.length > 0) && (data.length > 0)) {
        let permission = can.update(ctx.state.user, data[0])
        if (permission.granted) {
            try {
                let updatedProperty = ctx.request.body;
                await property.updateProperty(id, updatedProperty, agentId);
                ctx.status = 201;
                ctx.body = 'Property updated!'
            }
            catch (error) {
                ctx.status = 400;
                ctx.body = 'You submitted wrong values or you missing some, please check and try again';
            }
        }
        else {
            ctx.status = 403;
        }
    }
    else {
        ctx.status = 400;
        ctx.body = 'Wrong ID';
    }
}

/**
 * Function to delete agent's property by ID
 * This delete property and all images associated with the property
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteProperty(ctx) {
    let id = ctx.params.id;
    let agentId = ctx.state.user.agentid
    let data = await property.getById(id, agentId);
    if ((id > 0) && (!isNaN(id)) && (data.length > 0)) {
        let agentId = ctx.state.user.agentid
        let permission = can.delete(ctx.state.user, data[0])
        if (permission.granted) {
            try {
                let dir = `./public/${id}`;
                fs.rmdirSync(dir, { recursive: true })
                await property.deleteProperty(id, agentId);
                ctx.status = 201;
                ctx.body = 'Property deleted!';
            }
            catch (e) {
                ctx.status = 500;
            }
        }
        else {
            ctx.status = 403;
        }
    }
    else {
        ctx.status = 400;
        ctx.body = 'Wrong input'
    }
}

module.exports = router;