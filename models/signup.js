/**
* A module with methods used in sign up process
* @module models/signup
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')
const bcrypt = require('bcrypt');

/**
 * Model to check if username already exists
 * @param {string} string - username
 * @returns {object} object - returning data
 */
exports.getUsername = async function getUsername(userInput) {
    let sql = 'SELECT username FROM agents WHERE username = $1;';
    let username = await db.query(sql, userInput)
    .then(username => {
        return username
    })
    .catch(e => console.error(e.stack));
    return username;
}

/**
 * Model to check if email already exists
 * @param {string} string - email
 * @returns {object} object - returning data
 */
exports.getEmail = async function getEmail(email) {
    let sql = 'SELECT email FROM agents WHERE email = $1;';
    let eMail = await db.query(sql, email)
    .then(eMail => {
        return eMail
    })
    .catch(e => console.error(e.stack));
    return eMail;
}

/**
 * Model to insert new user into DB
 * @param {object} object - userdata
 * @param {string} string - role
 * @param {string} string - token
 * @param {string} string - token expiration time
 * @returns {string} string - returning username
 */
exports.signupAgent = async function signupAgent(userdata, role, token, expire) {
    let sql = ('INSERT INTO agents(\${keys:name}, role, verify_token, verify_token_expire) \
                VALUES(\${values:list}, \${role}, \${token}, \${expire}) \
                RETURNING username;')
    let obj = await db.query(sql, {
        keys: Object.keys(userdata),
        values: Object.values(userdata),
        role: role,
        token: token,
        expire: expire
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to compare encrypted signup code from database with user input
 * @param {string} string - sign up code
 * @returns {boolean} boolean - true/false if code matches
 */
exports.compareSecret = async function compareSecret(code) { 
    let sql = 'SELECT code FROM signup WHERE id=1;';
    let result = await db.query(sql)
    .then(async passwordhash => {
        let result = await bcrypt.compare(code,passwordhash[0].code)
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}