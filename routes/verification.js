/**
* A module with defined api endpoints for verification process
* @module routes/verification
* @author Filip Prosovsky
*/

/** Package definitions */
const Router = require('koa-router');
const router = Router({ prefix: '/api/v1/verification' });
const bodyParser = require('koa-bodyparser');

/** Load other modules */
const verification = require('../models/verification')
const crypt = require('../helpers/crypt')
const agent = require('../models/agents');

/** Route endpoints */
router.get('/', verifyToken)
router.get('/resend', resendToken)
router.get('/resetpass', resetPass)
router.post('/changepass', bodyParser(), changePass)

/**
 * Function to verify user account after sign up
 * Checks if token is still valid and activate account
 * If token is expired, it will send link to re-send activation link to user's email
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | object | string} object - message and link, string - message, integer - http status
 */
async function verifyToken(ctx) {
  try {
    let username = ctx.request.query.username
    let token = ctx.request.query.token
    let results = await verification.getToken(username)
    if (results) {
      let dbToken = results[0].verify_token
      let token_exp = results[0].verify_token_expire
      var currentDate = new Date()
      if ((dbToken === token) && (currentDate < token_exp)) {
        await verification.verified(username)
        ctx.status = 200;
        ctx.body = 'Account activated, you will be redirected to login'
      }
      else if ((dbToken === token) && (currentDate > token_exp)) {
        ctx.status = 498;
        ctx.body = {
          text: 'Token is expired. Please press "resend activation link"',
          link: `http://localhost:3005/api/v1/verification/resend?username=${username}`
        }
      }
      else {
        ctx.status = 400;
        ctx.body = 'Not valid, you will be redirected to homepage'

      }
    }
    else {
      ctx.status = 400;
      ctx.body = 'Not valid, you will be redirected to homepage'
    }
  }
  catch (e) {
    ctx.status = 500
    ctx.body = 'Problem occured'
  }
}

/**
 * Function to resend activation token
 * Generate new token and store in DB with expire time
 * Send activation link to email
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function resendToken(ctx) {
  let username = ctx.request.query.username
  let token = await crypt.gen();
  var expire = new Date()
  expire.setHours(expire.getHours() + 48)
  await verification.saveNewToken(token, expire, username);
  let userMail = (await agent.viewAgentByUsername(username))[0].email
  await verification.sendVerification(userMail, username, token);
  ctx.status = 200;
  ctx.body = 'Activation link was re-sent, please confirm in 48 hours'
}

/**
 * Function to validate token for password reset
 * Check if token is valid, if it is allow to fill new password
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function resetPass(ctx) {
  try {
    let username = ctx.request.query.username
    let token = ctx.request.query.token
    let results = await verification.getToken(username)
    let dbToken = results[0].verify_token
    let token_exp = results[0].verify_token_expire
    var currentDate = new Date()
    if ((dbToken === token) && (currentDate < token_exp)) {
      ctx.status = 200;
      ctx.body = 'Please fill your new password and click the button'
    }
    else if ((dbToken === token) && (currentDate > token_exp)) {
      ctx.status = 400;
      ctx.body = 'Link expired, please reset your password again'

    }
    else {
      ctx.status = 400;
      ctx.body = 'Not valid request, you will be redirected to homepage'
    }
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = 'Problem occured'
  }
}


/**
 * Function to enter new password after reset
 * Check if token is valid once again, get new password
 * Hash that password, store it in the database and activate account
 * @param {object} ctx - Koa req/res context object
 * @returns {integer | string} string - message, integer - http status
 */
async function changePass(ctx) {
  try {
    let username = ctx.request.query.username
    let token = ctx.request.query.token
    let results = await verification.getToken(username)
    let dbToken = results[0].verify_token
    let token_exp = results[0].verify_token_expire
    var currentDate = new Date()
    if ((dbToken === token) && (currentDate < token_exp)) {
      let password = ctx.request.body.secret
      if (await crypt.validatePassword(password)) {
        let secrets = await crypt.hashSecret(password);
        let userId = (await agent.viewAgentByUsername(username))[0].id
        await agent.updatePassword(userId, secrets.password, secrets.passwordsalt)
        await verification.verified(username)
        ctx.status = 200;
        ctx.body = 'Your password was changed, you will be redirected to login'
      }
      else {
        ctx.status = 405;
        ctx.body = 'Password is not strong enough'
      }
    }
    else {
      ctx.status = 400;
      ctx.body = 'Not valid request, you will be redirected to homepage'
    }
  }
  catch (e) {
    ctx.status = 500
    ctx.body = 'Problem occured'
  }
}

module.exports = router;