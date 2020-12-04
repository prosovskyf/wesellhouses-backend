/**
* A module with defined models for public properties view and filtering
* @module models/properties
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/
const db = require('../helpers/db.js')

/**
 * Model to get all properties based on applied filters
 * For features: input transformed into array, that array is aggregated in query taking one column from
 * multiple features rows with same FK property_id, output properties with features array 
 * @param {string} string - order
 * @param {string} string - direction
 * @param {array} array - features
 * @param {string} string - category
 * @returns {object} object - returning properties
 */
exports.getAll = async function getAll(order, direction, features, category) {
    let sql;
    let values;
    // Conditions if feature,category (is/is not) selected
    if ((features !== '') && (category !== '')) {
        // Pagination + features + categories 
        if (direction === 'DESC') {
            sql = `SELECT p.*, array_agg(f.feature) features FROM properties p \
            LEFT JOIN features f ON f.feature = ANY ($1:raw) \
            LEFT JOIN categories c ON c.id = p.category_id \
            WHERE ((f.property_id=p.id) AND (c.name=$3) AND (p.published=true)) \
            GROUP BY p.id ORDER BY $2:raw DESC;`
        }
        else {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            LEFT JOIN features f ON f.feature = ANY ($1:raw) \
            LEFT JOIN categories c ON c.id = p.category_id \
            WHERE ((f.property_id=p.id) AND (c.name=$3) AND (p.published=true)) \
            GROUP BY p.id ORDER BY $2:raw ASC;`
        }
        let featureArr = features.split(',');
        values =  [featureArr, order, category];
    }
    else if ((features !== '') && (category === '')) {
        // Pagination + features 
        if (direction === 'DESC') {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            WHERE ((f.property_id=p.id) AND (p.published=true)) \
            GROUP BY p.id ORDER BY $2:raw DESC;`
        }
        else {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            WHERE ((f.property_id=p.id) AND (p.published=true)) \
            GROUP BY p.id ORDER BY $2:raw ASC;`
        }
        let featureArr = features.split(',');
        values =  [featureArr, order];
    }
    else if ((features === '') && (category !== '')) {
        // Pagination + category
        if (direction === 'DESC') {
            sql = 'SELECT p.* FROM properties p \
                   LEFT JOIN categories c ON c.id = p.category_id \
                   WHERE ((c.name=$2) AND (p.published=true)) \
                   ORDER BY $1:raw DESC;'
        }
        else if(direction === 'ASC') {
            sql = 'SELECT p.* FROM properties p \
                   LEFT JOIN categories c ON c.id = p.category_id \
                   WHERE ((c.name=$2) AND (p.published=true)) \
                   ORDER BY $1:raw ASC;'
        }
        values =  [order, category];
    }
    else {
        // Pagination only - without features or category selected
        if (direction === 'DESC') {
            sql = 'SELECT * FROM properties p WHERE p.published=true \
                ORDER BY $1:raw DESC;'
        }
        else if(direction === 'ASC') {
            sql = 'SELECT * FROM properties p WHERE p.published=true \
                ORDER BY $1:raw ASC;'
        }
        values =  [order];
    }
    let results = await db.query(sql, values)
    .then(results => {
        return results
    })
    .catch(e => console.error(e.stack))
    return results;
}

/**
 * Model to get property by ID
 * @param {integer} integer - property ID
 * @returns {object} object - returning property
 */
exports.getById = async function getById(id) {
    let sql = 'SELECT p.*, array_agg(f.feature) features FROM properties p \
               LEFT JOIN features f ON f.property_id = p.id \
               INNER JOIN views ON views.id = p.id \
               WHERE ((p.id=$1) AND (p.published=true)) GROUP BY p.id;';
    let result = await db.query(sql, id)
    .then(async result => {
        return result
    })
    .catch(e => console.error(e.stack))
    return result
}










