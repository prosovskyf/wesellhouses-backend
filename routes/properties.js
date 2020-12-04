/**
* A module with defined api endpoints for public view of properties
* @module routes/properties
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/properties' });

/** Load other modules */
const property = require('../models/properties.js');
const views = require('../models/propertyViews.js');
const agent = require('../models/agents.js');

/** Route endpoints */
router.get('/', getAll);
router.get('/:id([0-9]{1,})', getById);

/**
 * Function to get properties based on supplied filter in query
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - properties, string - message, integer - http status
 */
async function getAll(ctx) {
    const { order = "created", direction = 'ASC', features = '', category = '' } = ctx.request.query;
    let results = await property.getAll(order, direction, features, category);
    if (results.length > 0) {
        ctx.status = 200;
        ctx.body = results;
    }
    else {
        ctx.status = 404;
        ctx.body = 'No properties found';
    }
}

/**
 * Function to get specific property by ID
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} 
 * object - property and agent info, string - message, integer - http status
 */
async function getById(ctx) {
    let id = ctx.params.id;
    if ((id > 0) && (!isNaN(id))) {
        let result = await property.getById(id);
        if (result.length > 0) {
            await views.updateViews(id);
            let agentId = result[0].agent_id;
            let agentInfo = await agent.viewAgent(agentId);
            ctx.status = 200;
            ctx.body = {
                property: result,
                agent: agentInfo
            }
        }
        else {
            ctx.status = 404;
            ctx.body = 'Property not found';
        }
    }
    else {
        ctx.status = 400;
        ctx.body = 'Wrong input';
    }
}

module.exports = router;