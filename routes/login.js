/**
* A module with defined api endpoints for managing login and password reset
* @module routes/login
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/login' });
require('dotenv').config();
const bodyParser = require('koa-bodyparser');
const passport = require('koa-passport');
const jwt = require("jsonwebtoken")

/** Strategy */
const basicAuth = require('../strategies/basicAuth');

/** Load other modules */
const agent = require('../models/agents');
const service = require('../models/signup');
const verification = require('../models/verification');
const crypt = require('../helpers/crypt')

/** JWT definitions */
const jwtKey = process.env.secret
const jwtExpirySeconds = 10000000000

/** Route endpoints */
router.post('/reset', bodyParser(), resetPass)

router.post('/',
  /**
   * Middleware to check username and password using Basic Auth strategy.
   * If success, call function login
   * @param {object} ctx - Koa req/res context object
   * @param {function} next - Koa next callback
   * @returns {integer | function | string} string - message, integer - http status, function - next() callback
   */
  async function (ctx, next) {
    passport.use(basicAuth)
    return passport.authenticate('basic', async function (err, user) {
      if (err) { return next(err) }
      if (user === false) {
        ctx.status = 401
        ctx.body = 'Wrong username or password'
      }
      else {
        ctx.state.user = user
        await next()
      }
    })(ctx, next)
  }, login)

/**
 * Function to sign JWT token and send it back to user
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} 
 * object - user data + token or resend activation link, string - message, integer - http status
 */
async function login(ctx) {
  try {
    let user = ctx.state.user;
    let result = await agent.viewAgentByUsername(user)
    if (result[0].verified) {
      const token = jwt.sign({ user, agentid: result[0].id, role: result[0].role }, jwtKey, {
        algorithm: "HS256",
        expiresIn: jwtExpirySeconds,
        issuer: 'jwt.localhost',
        audience: 'localhost'
      });
      ctx.status = 200;
      ctx.body = {
        user: {
          id: result[0].id,
          username: user,
          role: result[0].role,
          token: token
        },
        message: 'You successfully logged on'
      }
    }
    else {
      let link = `http://localhost:3005/api/v1/verification/resend?username=${user}`
      ctx.status = 409;
      ctx.body = {
        message: {
          text: 'You need to activate your account by clicking on link sent to you during registration.\n' +
            `If you need to resend you activation link click on "Resend activation link"`,
          link: link
        }
      }
    }
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = 'Problem occured, try again'
  }
}

/**
 * Function to send link to email for password reset
 * It generates token and set expire time for 48 hours, disable account and send link to user email
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function resetPass(ctx) {
  try {
    let data = ctx.request.body.user;
    let user = await service.getUsername(data)
    let email = await service.getEmail(data)
    let expire;
    if ((user.length > 0) && (typeof user[0].username != "undefined")) {
      let username = user[0].username
      let results = (await agent.viewAgentByUsername(username))[0]
      let token = await crypt.gen();
      expire = new Date()
      expire.setHours(expire.getHours() + 48)
      await verification.saveNewToken(token, expire, username);
      await verification.disableAccount(username)
      await verification.sendReset(results.email, results.username, token)
      ctx.status = 200;
      ctx.body = 'Link to reset your password was sent to your email address'
    }
    else if ((email.length > 0) && (typeof email[0].email != "undefined")) {
      let results = (await agent.viewAgentByEmail(email[0].email))[0]
      let token = await crypt.gen();
      expire = new Date()
      expire.setHours(expire.getHours() + 48)
      await verification.saveNewToken(token, expire, results.username);
      await verification.sendReset(results.email, results.username, token)
      ctx.status = 200;
      ctx.body = 'Link to reset your password was sent to your email address'
    }
    else {
      ctx.status = 404;
      ctx.body = 'User with specified username or email does not exist'
    }
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = 'Problem occured, try again'
  }
}

module.exports = router;