/**
 * A module to run validation and crypto tasks
 * @module helpers/crypt
 * @author Filip Prosovsky
 */

const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js')
const crypto = require('crypto')
require('dotenv').config();
const secretKey = process.env.secret;

/**  Function to validate email, email must be in format name@domain. 2to4 chars 
 * @param {string} string of user entered email
 * @returns {boolean} result if email has valid format
*/
exports.validateEmail = function validateEmail(email) {
    var format = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return format.test(email);
}
/**  Function to validate password, password must contain lower and uppper case, special character
* and must be longer than 8 characters 
* @param {string} string of user entered password
* @returns {boolean} result if password has valid format
*/
exports.validatePassword = function validatePassword(pass) {
    var req = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
    return req.test(pass);
}

/**  Function using bcrypt lib to hash the password using salt 
 * @param {string} string of user password
 * @returns {object} result of hashed password and salt
*/
exports.hashSecret = async function hashPassword(userSecret) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(userSecret, salt)
    return {
        password: hash,
        passwordsalt: salt
    }
}

/** Function using bcrypt lib to hash the password using salt 
 * @param {string} string to be encrypted
 * @returns {string} result of encrypted values
*/
exports.encrypt = function encrypt(object) {
    let values = CryptoJS.AES.encrypt(JSON.stringify(object), secretKey).toString();
    return values;
}

/**  Function using bcrypt lib to hash the password using salt 
 * @param {string} string to be decrypted
 * @returns {string} result of decrypted values
*/
exports.decrypt = function decrypt(object) {
    let decipher = CryptoJS.AES.decrypt(object, secretKey);
    let decrypted = JSON.parse(decipher.toString(CryptoJS.enc.Utf8));
    return decrypted;
}

/**  Function to generate random token 
 * @returns {string} result of generated token
*/
exports.gen = function gen() {
    let token = crypto.randomBytes(64).toString('hex');
    return token
}