/**
* A module with defined models for file paths manipulation
* @module models/files
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')

/**
 * Model to insert path of images, based on property name when 0 files in directory
 * @param {string} string - path
 * @param {integer} integer - property id
 */
exports.insertPathImages = async function insertPathImages(path, propertyId) {
    let sql = ('UPDATE properties SET image_url=\${path} WHERE id = \${property_id} ;');
    let obj = await db.query(sql, {
        path: path,
        property_id: propertyId
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to insert path of images for category
 * @param {string} string - path
 * @param {integer} integer - category id
 */
exports.insertPathCategoryImage = async function insertPathCategoryImage(path, categoryId) {
    let sql = ('UPDATE categories SET image_url=\${path} WHERE id = \${id} ;');
    let obj = await db.query(sql, {
        path: path,
        id: categoryId
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to delete path of images for category
 * @param {integer} integer - category id
 */
exports.deletePathCategoryImage = async function deletePathCategoryImage(id) {
    let sql = 'UPDATE categories SET image_url=NULL WHERE id = $1;'
    let obj = await db.query(sql, id)
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to insert path of video based on property id
 * @param {string} string - path
 * @param {integer} integer - property id
 */
exports.insertPathVideo = async function insertPathVideo(path, propertyId) {
    let sql = ('UPDATE properties SET video_url=\${path} WHERE id = \${property_id} ;');
    let obj = await db.query(sql, {
        path: path,
        property_id: propertyId
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to delete path of images when there is last image to be deleted
 * @param {integer} integer - property id
 */
exports.deletePathImages = async function deletePathImages(id) {
    let sql = 'UPDATE properties SET image_url=NULL WHERE id = $1;'
    let obj = await db.query(sql, id)
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to delete path of video based on property id
 * @param {integer} integer - property id
 */
exports.deletePathVideo = async function deletePathVideo(id) {
    let sql = 'UPDATE properties SET video_url=NULL WHERE id = $1;'
    let obj = await db.query(sql, id)
    .catch(e => console.error(e.stack))
    return obj;
}