/**
* A module with defined models for agents routes
* @module models/agents
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')
const bcrypt = require('bcrypt');

/**
 * Model to view user information based on agentID
 * @param {integer} integer - user ID
 * @returns {object} object - user information
*/
exports.viewAgent = async function viewAgent(agentId) {
    let sql = ('SELECT id,firstname,lastname,username,about,picture_url,phone,role,email FROM agents WHERE id=$1;');
    let obj = await db.query(sql, agentId)
        .then(async obj => {
            return obj
        })
        .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to view user information based on username
 * @param {string} string - username
 * @returns {object} object - user information
 */
exports.viewAgentByUsername = async function viewAgentByUsername(username) {
    let sql = ('SELECT id,username,email,role,verified FROM agents WHERE username=$1;');
    let obj = await db.query(sql, username)
        .then(async obj => {
            return obj
        })
        .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to view user information based on email
 * @param {string} string - email
 * @returns {object} object - user information
 */
exports.viewAgentByEmail = async function viewAgentByEmail(email) {
    let sql = ('SELECT id,username,email,role,verified FROM agents WHERE email=$1;');
    let obj = await db.query(sql, email)
        .then(async obj => {
            return obj
        })
        .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to update user information based on user id
 * @param {integer} integer - user id
 * @param {object} object - information to be updated
 * @returns {object} object - returning user information
 */
exports.updateAgent = async function updateAgent(id, updatedValues) {
    let keys = Object.keys(updatedValues)
    let values = Object.values(updatedValues)
    let i = 0;
    for (i; i < keys.length; i++) {
        let sql = `UPDATE agents SET \${keys:name}=\${values:list} WHERE id=\${id} \
                       RETURNING firstname,lastname,username,about,phone;`;
        var obj = await db.query(sql, {
            id: id,
            keys: keys[i],
            values: values[i]
        })
            .then(obj => {
                return obj
            })
            .catch(e => console.error(e.stack))
    }
    return obj;
}
/**
 * Model to update user avatar path 
 * @param {string} string - picture path
 * @param {integer} integer - user id
 * @returns {object} object - returning picture_url
 */
exports.uploadPicturePath = async function uploadPicturePath(path, agentId) {
    let sql = ('UPDATE agents SET picture_url=\${path} WHERE id = \${agent_id} RETURNING picture_url;');
    let obj = await db.query(sql, {
        path: path,
        agent_id: agentId
    })
        .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to delete user avatar path 
 * @param {integer} integer - user id
 */
exports.deletePicturePath = async function deletePicturePath(agentId) {
    let sql = 'UPDATE agents SET picture_url=NULL WHERE id = $1;'
    let obj = await db.query(sql, agentId)
        .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to update user password
 * @param {integer} integer - user id
 * @param {string} string - hashed password
 * @param {string} string - password salt
 * @returns {object} object - returning updated values
 */
exports.updatePassword = async function updatePassword(id, password, salt) {
    let sql = `UPDATE agents SET password=\${pass}, passwordsalt=\${salt} WHERE id=\${id} RETURNING *;`;
    var obj = await db.query(sql, {
        id: id,
        pass: password,
        salt: salt
    })
        .then(obj => {
            return obj
        })
        .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to get and verify user password using bcrypt
 * @param {string} string - username
 * @param {string} string - password
 */
exports.verifySecret = async function verifySecret(username, password) {
    let sql = 'SELECT password FROM agents WHERE username =$1;';
    let result = await db.query(sql, username)
        .then(async passwordhash => {
            passwordhash = passwordhash[0].password
            let result = await bcrypt.compare(password, passwordhash)
            return result
        })
        .catch(e => console.error(e.stack))
    return result
}
