/**
* A module with defined models for properties view and manipulation by agents
* @module models/propertiesAgent
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')

/**
 * Model to get all agent's properties based on applied filters
 * For features: input transformed into array, that array is aggregated in query taking one column from
 * multiple features rows with same FK property_id, output properties with features array 
 * @param {string} string - order
 * @param {string} string - direction
 * @param {array} array - features
 * @param {string} string - category
 * @param {integer} integer - agent ID
 * @returns {object} object - returning properties
 */
exports.getAllByAgent = async function getAllByAgent(order, direction, features, category, agentId) {
    let sql;
    let values;
    // Conditions if feature,category (is/is not) selected
    if ((features !== '') && (category !== '')) {
        // Pagination + features + categories 
        if (direction === 'DESC') {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            LEFT JOIN categories c ON c.id = p.category_id \
            WHERE ((f.property_id=p.id) AND (c.name=$3) AND (p.agent_id=$4)) \
            GROUP BY p.id ORDER BY $2:raw DESC;`
        }
        else {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            LEFT JOIN categories c ON c.id = p.category_id \
            WHERE ((f.property_id=p.id) AND (c.name=$3) AND (p.agent_id=$4)) \
            GROUP BY p.id ORDER BY $2:raw ASC;`
        }
        let featureArr = features.split(',');
        values = [featureArr, order, category, agentId];
    }
    else if ((features !== '') && (category === '')) {
        // Pagination + features 
        if (direction === 'DESC') {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            WHERE ((f.property_id=p.id) AND (p.agent_id=$3)) \
            GROUP BY p.id ORDER BY $2:raw DESC;`
        }
        else {
            sql = `SELECT p.*,array_agg(f.feature) features FROM properties p \
            JOIN features f ON f.feature = ANY ($1:raw) \
            WHERE ((f.property_id=p.id) AND (p.agent_id=$3)) \
            GROUP BY p.id ORDER BY $2:raw ASC;`
        }
        let featureArr = features.split(',');
        values = [featureArr, order, agentId];
    }
    else if ((features === '') && (category !== '')) {
        // Pagination + category
        if (direction === 'DESC') {
            sql = 'SELECT p.* FROM properties p  \
                LEFT JOIN categories c ON c.id = p.category_id \
                WHERE ((c.name=$2) AND (p.agent_id=$3)) \
                ORDER BY $1:raw DESC;'
        }
        else if (direction === 'ASC') {
            sql = 'SELECT p.* FROM properties p  \
                   LEFT JOIN categories c ON c.id = p.category_id \
                   WHERE ((c.name=$2) AND (p.agent_id=$3)) \
                   ORDER BY $1:raw ASC;'
        }
        values = [order, category, agentId];
    }
    else {
        // Pagination only - without features or category selected
        if (direction === 'DESC') {
            sql = 'SELECT * FROM properties p WHERE p.agent_id=$2 \
                ORDER BY $1:raw DESC;'
        }
        else if (direction === 'ASC') {
            sql = 'SELECT * FROM properties p WHERE p.agent_id=$2 \
                ORDER BY $1:raw ASC;'
        }
        values = [order, agentId];
    }
    let results = await db.query(sql, values)
        .then(results => {
            return results
        })
        .catch(e => console.error(e.stack))
    return results;
}

/**
 * Model to get specific agent's property by ID 
 * @param {integer} integer - property ID
 * @param {integer} integer - agent ID
 * @returns {object} object - returning property
 */
exports.getById = async function getById(id, agentId) {
    let sql = 'SELECT p.*,array_agg(f.feature) features FROM properties p \
               LEFT JOIN features f ON f.property_id = p.id\
               INNER JOIN views ON views.id = p.id \
               WHERE ((p.id=$1) AND (p.agent_id=$2)) GROUP BY p.id;';
    let result = await db.query(sql, [id, agentId])
        .then(async result => {
            return result
        })
        .catch(e => console.error(e.stack));
    return result
}

/**
 * Model to get specific agent's properties marked as high priority
 * @param {integer} integer - agent ID
 * @returns {object} object - returning properties
 */
exports.getHighPriority = async function getHighPriority(agentId) {
    let sql = 'SELECT * FROM properties p WHERE ((p.agent_id=$1) AND (p.high_priority=true));';
    let result = await db.query(sql, agentId)
        .then(async result => {
            return result
        })
        .catch(e => console.error(e.stack));
    return result
}

/**
 * Model to insert property listing
 * @param {object} object - property data
 * @param {integer} integer - agent ID
 * @returns {object} object - returning property
 */
exports.createProperty = async function createProperty(newProperty, agentId) {
    let sql = `WITH properties AS (INSERT INTO properties(\${keys:name}, agent_id) VALUES(\${values:list}, \${agent_id}) RETURNING *), \
                    views AS (INSERT INTO views(id) SELECT id FROM properties RETURNING *) \
               SELECT p.*, v.views FROM properties p, views v WHERE v.id = p.id;`;
    let obj = await db.query(sql, {
        keys: Object.keys(newProperty),
        values: Object.values(newProperty),
        agent_id: agentId
    })
        .then(obj => {
            return obj
        })
        .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to update property listing
 * @param {integer} integer - property id
 * @param {object} object - property data
 * @param {integer} integer - agent ID
 */
exports.updateProperty = async function updateProperty(id, updatedProperty, agentId) {
    let keys = Object.keys(updatedProperty)
    let values = Object.values(updatedProperty)
    let i = 0;
    for (i; i < keys.length; i++) {
        let sql = `UPDATE properties p SET \${keys:name}=\${values:list} \
                       WHERE ((id=\${id}) AND (p.agent_id=\${agentid}));`;
        var obj = await db.query(sql, {
            id: id,
            agentid: agentId,
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
 * Model to delete property listing and related features
 * @param {integer} integer - property id
 * @returns {object} object - returning title
 */
exports.deleteProperty = async function deleteProperty(id) {
    let sql = 'DELETE FROM views WHERE id=$1; \
               DELETE FROM features WHERE property_id=$1; \
               DELETE FROM properties WHERE id=$1 RETURNING title;';
    let obj = await db.query(sql, id)
        .then(obj => {
            return obj
        })
        .catch(e => console.error(e.stack))
    return obj;
}





