/**
 * A module to run JSON schema validation on req/res
 * @module controllers/validation
 * @author Filip Prosovsky
 * @see schemas/* for JSON schemas defined
 */
const { Validator, ValidationError } = require('jsonschema');
const agentSchema = require('../schemas/agents.json').definitions.agent
const agentUpdateSchema = require('../schemas/agents.json').definitions.agentUpdate
const categorySchema = require('../schemas/categories.json').definitions.category;
const featureSchema = require('../schemas/features.json').definitions.feature;
const messageSchema = require('../schemas/messages.json').definitions.messageSend;
const messageFirstSchema = require('../schemas/messages.json').definitions.messageSendFirst;
const propertySchema = require('../schemas/properties.json').definitions.property;

/**
 * Wrapper of validator to be used as a middleware
 * @param {object} schema - JSON schema definition for specific resource
 * @param {string} resource - The name of the resource ('property')
 * @returns {function} - A Koa middleware handler taking (ctx, next) params
 */
function makeValidator(schema, resource) {

    const v = new Validator();
    const validationOptions = {
        throwError: true,
        propertyName: resource
    };

  /**
   * Actual middleware function to be used in validation
   * @param {object} ctx - Koa req/res context object
   * @param {function} next - Koa next callback
   * @throws {ValidationError} a jsonschema library exception
   */
    async function handler(ctx, next) {

        const body = ctx.request.body;

        try {
            v.validate(body, schema, validationOptions);
            await next();
        } catch (error) {
            if (error instanceof ValidationError) {
                ctx.status = 400
                ctx.body = error.stack;
            } else {
                throw error;
            }
        }
    }
    return handler;
}

/** Validate data against agent schema */
exports.validateAgent = makeValidator(agentSchema, 'agent');
exports.validateAgentUpdate = makeValidator(agentUpdateSchema, 'agentUpdate');
/** Validate data against category schema */
exports.validateCategory = makeValidator(categorySchema, 'category');
/** Validate data against features schema */
exports.validateFeature = makeValidator(featureSchema, 'feature');
/** Validate data against messages schema */
exports.validateFirstMessage = makeValidator(messageFirstSchema, 'messageSendFirst');
exports.validateMessage = makeValidator(messageSchema, 'messageSend');
/** Validate data against property schema */
exports.validateProperty = makeValidator(propertySchema, 'property');