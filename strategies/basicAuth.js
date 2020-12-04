/**
* A module with defined Basic strategy to be used ONLY during log on
* @module strategies/basicAuth
* @author Filip Prosovsky
* @see /routes/login /* where this strategy is used
*/

const BasicStrategy = require('passport-http').BasicStrategy;
const agent = require('../models/agents');

/**
 * A model to check if user exists and compare supplied password calling verifySecret module
 * defined in @see /models/agent /*
 * @param {object} object - username
 * @param {object} object - password
 * @param {object} object - callback 
 * @returns {(null | boolean | string)} 
 * (null | boolean | string) - if authenticated return user, if not, return false
 */
const checkUserAndPass = async (username, password, done) => {
    let result;
    try {
        result = await agent.viewAgentByUsername(username);
        if (result.length) {
            const user = result[0].username;
            if (await agent.verifySecret(username, password)) {
                return done(null, user);
            }
        }
        return done(null, false);
    }
    catch (error) {
        console.error(`Error during authentication for user ${username}`);
        return done(error);
    }
}

const strategy = new BasicStrategy(checkUserAndPass);
module.exports = strategy;