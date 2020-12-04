/**
* A module with defined models for category view and manipulation by agents
* @module models/propertyCategory
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')

/**
 * Model to get all categories
 * @returns {object} object - returning categories
 */
exports.getCategories = async function getCategories() {
    let sql = 'SELECT * FROM categories';
    let result = await db.query(sql)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}

/**
 * Model to get category by ID
 * @param {integer} integer - category ID
 * @returns {object} object - returning category
 */
exports.getCategoryById = async function getCategoryById(id) {
    let sql = 'SELECT * FROM categories WHERE id=$1';
    let result = await db.query(sql, id)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}

/**
 * Model to insert category
 * @param {object} object - new category data
 * @returns {integer} integer - returning inserted category id
 */
exports.createCategory = async function createCategory(newCategory) {
    let sql = `INSERT INTO categories(\${keys:name}) VALUES(\${values:list}) RETURNING id`;
    let obj = await db.query(sql, {
        keys: Object.keys(newCategory),
        values: Object.values(newCategory)
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
return obj
}

/**
 * Model to update category
 * @param {integer} integer - category ID
 * @param {object} object - updated category data
 * @returns {object} object - returning category
 */
exports.updateCategory = async function updateCategory(id, updatedCategory) {
    let keys = Object.keys(updatedCategory)
    let values = Object.values(updatedCategory)
    let i = 0;
        for (i; i < keys.length; i++) {
            let sql = `UPDATE categories SET \${keys:name}=\${values:list} WHERE id=\${id} RETURNING *;`;
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
 * Model to delete category
 * @param {integer} integer - category ID
 * @returns {boolean} boolean - returning true
 */
exports.deleteCategory = async function deleteCategory(id) {
    let sql = 'DELETE FROM categories WHERE id=$1 RETURNING true;';
    let obj = await db.query(sql, id)
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
    return obj;
}

