/**
* A module with defined models for features view and manipulation by agents
* @module models/propertyFeatures
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')

/**
 * Model to get all features using DISTINCT as properties can have same feature defined
 * @returns {object} object - returning features
 */
exports.getFeatures = async function getFeatures() {
    let sql = 'SELECT DISTINCT feature FROM features';
    let result = await db.query(sql)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}

/**
 * Model to get features by property ID
 * @param {integer} integer - property ID
 * @returns {object} object - returning features
 */
exports.getFeatureById = async function getFeatureById(id) {
    let sql = 'SELECT * FROM features WHERE property_id=$1';
    let result = await db.query(sql, id)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}

/**
 * Model to create new feature
 * @param {string} string - new feature
 * @param {integer} integer - property ID
 */
exports.createFeature = async function createFeature(newFeature, id) {
    let sql = `INSERT INTO features(feature, property_id) VALUES(\${newFeature}, \${property_id});`;
    let obj = await db.query(sql, {
        newFeature: newFeature,
        property_id: id
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
return obj
}

/**
 * Model to delete feature
 * @param {string} string - feature to be deleted
 * @param {integer} integer - property ID
 */
exports.deleteFeature = async function deleteFeature(features, id) {
    let sql = `DELETE FROM features WHERE ((property_id=\${id}) AND (feature=\${deleteFeature}));`;
    let obj = await db.query(sql, {
        id: id,
        deleteFeature: features
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to delete all features for selected property
 * @param {integer} integer - property ID
 */
exports.deleteAllFeaturesById = async function deleteAllFeaturesById(id) {
    let sql = `DELETE FROM features WHERE property_id=$1;`;
    let obj = await db.query(sql, id)
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack))
    return obj;
}
