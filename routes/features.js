/**
* A module with defined api endpoints for managing features
* @module routes/features
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/features' });
const bodyParser = require('koa-bodyparser');

/** Load other modules */
const { validateFeature } = require('../controllers/validation')
const features = require('../models/propertyFeatures.js');
const auth = require('../controllers/auth')
const can = require('../permissions/features')

/** Route endpoints */
router.get('/', getFeatures);
router.post('/:id([0-9]{1,})', auth, bodyParser(), validateFeature, createFeature);
router.del('/all/:id([0-9]{1,})', auth, bodyParser(), deleteAllFeatures);
router.del('/:id([0-9]{1,})', auth, bodyParser(), deleteFeature);

/**
 * Function to list all features
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - festures data, string - message, integer - http status
 */
async function getFeatures(ctx) {
    let results = await features.getFeatures();
    if (results.length > 0) {
        ctx.status = 200;
        ctx.body = results;
    }
    else {
        ctx.status = 404;
    }
}

/**
 * Function to list all features, will check permission first, then create feature
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function createFeature(ctx) {
    let permission = can.create(ctx.state.user)
    if (permission.granted) {
        try {
            let id = ctx.params.id;
            let feature = ctx.request.body.feature
            for (let i = 0; i < feature.length; i++) {
                await features.createFeature(feature[i], id);
            }
            ctx.status = 201;
            ctx.body = 'Features created';
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
 * Function to delete feature, will check permission first, then delete feature
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteFeature(ctx) {
    let permission = can.delete(ctx.state.user)
    if (permission.granted) {
        let id = ctx.params.id;
        let feature = ctx.request.body
        if ((id > 0) && (!isNaN(id))) {
            for (let i = 0; i < feature.length; i++) {
                await features.deleteFeature(feature[i], id);
            }
            ctx.status = 201;
            ctx.body = 'Feature deleted';
        }
        else {
            ctx.status = 400;
            ctx.body = 'Wrong input'
        }
    }
    else {
        ctx.status = 403;
    }
}

/**
 * Function to delete ALL features, will check permission first, then delete features
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function deleteAllFeatures(ctx) {
    let permission = can.delete(ctx.state.user)
    if (permission.granted) {
        let id = ctx.params.id;
        if ((id > 0) && (!isNaN(id))) {
            await features.deleteAllFeaturesById(id);
            ctx.status = 201;
            ctx.body = 'All features deleted';
        }
        else {
            ctx.status = 400;
            ctx.body = 'Wrong input'
        }
    }
    else {
        ctx.status = 403;
    }
}

module.exports = router;