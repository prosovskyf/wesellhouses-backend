/**
 * A module to run passport authentication by defined strategies
 * @module controllers/auth
 * @author Filip Prosovsky
 * @see strategies/* for passport strategies defined
 */

const passport = require('koa-passport');
const jwt = require('../strategies/jwt')

passport.use(jwt)

/**
 * Exports a middleware with JWT strategy
 */
module.exports = passport.authenticate(['jwt'], {session:false});


