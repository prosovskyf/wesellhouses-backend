/**
* A module to update views count for property
* @module models/propertyViews
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js');

/**
 * Model to update views count for specific property
 * @param {integer} integer - property ID
 */
exports.updateViews = async function updateViews(id) {
    let sql='UPDATE views SET views = views + 1 WHERE id = $1;';
    await db.query(sql, id)
}