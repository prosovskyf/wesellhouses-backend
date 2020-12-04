/**
* A Script definition to hash signup code which will be saved in database
* @module scripts/hash_signupcode
* @author Filip Prosovsky
*/

const bcrypt = require('bcrypt');

/**
 * Function to hash sign up code
 * @param {string} string - signup code
 * @returns {object} object - hashed code and code salt
 */
async function hashSignUpCode(signUpCode) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(signUpCode, salt)
    return {
        code: hash,
        codesalt: salt
    }
}

/**
 * Function to insert code and get it hashed
 * @returns {object} object - hashed code and code salt
 */
function hashCode() {
    let output = hashSignUpCode('YOUR_SIGNUP_CODE');
    return output
}
/** run "node hash_signupcode.js" and store output to your database based on commands in create-signupcode.sql */
hashCode();