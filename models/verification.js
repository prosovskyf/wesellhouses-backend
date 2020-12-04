/**
* A module with methods used in sign up process - verification
* @module models/verification
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')
const sgMail = require('@sendgrid/mail')
require('dotenv').config();

/**
 * Model to send verification token to email during signup
 * @param {string} string - email
 * @param {string} string - username
 * @param {string} string - token
 */
exports.sendVerification = async function sendVerification(email, username, token) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: email, // Recipient
        from: 'wesellhouses.noreply@gmail.com', // My sender
        templateId: "d-7d520bd01f7f4024abfb0f048559fcab",
        //extract the custom fields from dynamic template on sendgrid
        dynamic_template_data: {
            confirm_url:  `http://localhost:3000/verification/username=${username}&token=${token}`
        },
        hideWarnings: true
    }
    sgMail 
    .send(msg)
    .catch((error) => {
        console.error(error)
    })
}

/**
 * Model to send reset token to email when reset password is requested
 * @param {string} string - email
 * @param {string} string - username
 * @param {string} string - token
 */
exports.sendReset = async function sendReset(email, username, token) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: email, // Recipient
        from: 'wesellhouses.noreply@gmail.com', // My sender
        templateId: "d-0009447621094b01981368a1bcd7e05f",
        //extract the custom fields from dynamic template on sendgrid
        dynamic_template_data: {
            reset_url:  `http://localhost:3000/verification/resetpass/username=${username}&token=${token}`
        },
        hideWarnings: true
    }
    sgMail 
    .send(msg)
    .catch((error) => {
        console.error(error)
    })
}

/**
 * Model to get token and token expire from database based on username
 * @param {string} string - username
 * @returns {object} object - token and token expire date
 */
exports.getToken = async function getToken(username) {
    let sql = 'SELECT verify_token,verify_token_expire FROM agents WHERE username = $1;';
    let dbtoken = await db.query(sql, username)
    .then(dbtoken => {
        return dbtoken
    })
    .catch(e => console.error(e.stack));
    return dbtoken;
}

/**
 * Model to save new token when user request operation which requires one (reset pass)
 * @param {string} string - email
 * @param {string} string - username
 * @param {string} string - token
 */
exports.saveNewToken = async function saveNewToken(token, expire, username) {
    let sql = ('UPDATE agents SET verify_token=\${token}, verify_token_expire=\${expire} WHERE username=\${username};')
    let obj = await db.query(sql, {
        token: token,
        expire: expire,
        username: username
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to update user account as verified and delete token from DB
 * @param {string} string - username
 */
exports.verified = async function verified(username) {
    let sql = 'UPDATE agents SET verified=true WHERE username = $1; \
               UPDATE agents SET verify_token=null,verify_token_expire=null WHERE username = $1;';
    let verify = await db.query(sql, username)
    .then(verify => {
        return verify
    })
    .catch(e => console.error(e.stack));
    return verify;
}

/**
 * Model to disable account on password reset 
 * @param {string} string - username
 */
exports.disableAccount = async function disableAccount(username) {
    let sql = 'UPDATE agents SET verified=false WHERE username = $1;'
    let verify = await db.query(sql, username)
    .then(verify => {
        return verify
    })
    .catch(e => console.error(e.stack));
    return verify;
}
