/**
* A module with methods used to get and store zoopla data
* @module models/zoopla
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')

/**
 * Model to get zoopla data stored in database
 * @param {string} string - postcode
 * @returns {object} object - zoopla data
 */
exports.getData = async function getData(postcode) {
    let sql = 'SELECT * FROM zoopla WHERE postcode=$1';
    let result = await db.query(sql, postcode)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}

/**
 * Model to insert fetched zoopla data for future use
 * @param {object} object - fetched zoopla data
 */
exports.createData = async function createData(newData) {
    let sql = `INSERT INTO zoopla(\${keys:name}) VALUES(\${values:list})`;
    let obj = await db.query(sql, {
        keys: Object.keys(newData),
        values: Object.values(newData)
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
return obj
}