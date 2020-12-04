/**
* A module to be used as middleware to check user role
* @module helpers/isAgent
* @author Filip Prosovsky
* @see routes/* for the routes when this module is used
*/

/**  Function to validate email, email must be in format name@domain. 2to4 chars 
 * @param {object} ctx - Koa req/res context object
 * @param {function} next - Koa next callback
*/
module.exports = async function isAgent(ctx, next) {
    let role = ctx.state.user.role;
    if ((role === 'agent') || (role === 'admin')) {
        return next();
    }
    else {
        ctx.status = 403;
    }
}