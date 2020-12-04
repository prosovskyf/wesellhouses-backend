/**
* A module with defined models for message manipulation
* @module models/messages
* @author Filip Prosovsky
* @see routes/* where these models are being used
*/

const db = require('../helpers/db.js')
const crypt = require('../helpers/crypt')

/**
 * Model to create message thread between agent - user based on property id
 * @param {string} string - subject of the thread
 * @param {integer} integer - property ID
 * @param {string} string - agent usernname
 * @param {string} string - user username
 * @returns {integer} integer - returning ID of create thread
 */
exports.createThread = async function createThread(subject, property_id, agent, user) {
    let sql = ('INSERT INTO message(subject, property_id, agent_name, user_name) \
                VALUES(\${subject},\${property_id},\${agent},\${user}) RETURNING id;');
    let obj = await db.query(sql, {
        subject: subject,
        property_id: property_id,
        agent: agent,
        user: user
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to get message thread between agent - user based on property id
 * @param {integer} integer - property ID
 * @param {string} string - agent usernname
 * @param {string} string - user username
 * @returns {object} object - returning info about thread
 */
exports.getThreadByProperty = async function getThreadByProperty(property_id, agent, user) {
    let sql = ('SELECT * FROM message WHERE ((agent_name=\${agent}) AND (user_name=\${user}) AND (property_id=\${property_id}));');
    let obj = await db.query(sql, {
        property_id: property_id,
        agent: agent,
        user: user
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to get message thread based on thread id
 * @param {integer} integer - thread ID
 * @returns {object} object - returning info about thread
 */
exports.getThread = async function getThread(id) {
    let sql = ('SELECT * FROM message WHERE id=$1');
    let obj = await db.query(sql, id)
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to update message thread time - last time of inserted messages
 * @param {string} string - time
 * @param {integer} integer - thread ID
 */
exports.updateLastMessageTime = async function updateLastMessageTime(time, id) {
    let sql = ('UPDATE message SET updated_time=\${time} WHERE id=\${id};');
    let obj = await db.query(sql, {
        time: time,
        id: id
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to get message thread for user with USER ROLE
 * @param {string} string - user username
 * @returns {object} object - returning info about thread
 */
exports.getThreadsUser = async function getThreadsUser(user) {
    let sql = ('SELECT id,property_id,subject,agent_name,user_name,updated_time FROM message \
                WHERE ((user_name=\${user}) AND (archived_user=false) AND (del_for_user=false));');
    let obj = await db.query(sql, {
        user: user
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to get archived message thread for user with USER ROLE
 * @param {string} string - user username
 * @returns {object} object - returning info about archived thread
 */
exports.getArchivedThreadsUser = async function getArchivedThreadsUser(user) {
    let sql = ('SELECT id,property_id,subject,agent_name,user_name,updated_time FROM message \
               WHERE ((user_name=\${user}) AND (archived_user=true) AND (del_for_user=false));');
    let obj = await db.query(sql, {
        user: user
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to get message thread for user with AGENT ROLE
 * @param {string} string - agent username
 * @returns {object} object - returning info about thread
 */
exports.getThreadsAgent = async function getThreadsAgent(agent) {
    let sql = ('SELECT id,property_id,subject,agent_name,user_name,updated_time FROM message \
                WHERE ((agent_name=\${user}) AND (archived_agent=false) AND (del_for_agent=false));');
    let obj = await db.query(sql, {
        user: agent
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}
/**
 * Model to get archived message thread for user with AGENT ROLE
 * @param {string} string - agent username
 * @returns {object} object - returning info about archived thread
 */
exports.getArchivedThreadsAgent = async function getArchivedThreadsAgent(agent) {
    let sql = ('SELECT id,property_id,subject,agent_name,user_name,updated_time FROM message \
                WHERE ((agent_name=\${user}) AND (archived_agent=true) AND (del_for_agent=false));');
    let obj = await db.query(sql, {
        user: agent
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to send message
 * @param {string} string - message
 * @param {integer} integer - message thread ID
 * @param {string} string - user username
 * @returns {object} object - returning true and date of message
 */
exports.sendMessage = async function sendMessage(message, message_thread, author) {
    let encrypted = crypt.encrypt(message)
    let sql = ('INSERT INTO messages(message, message_thread, author) \
                VALUES(\${message},\${thread},\${author}) RETURNING true,date;');
    let obj = await db.query(sql, {
        message: encrypted,
        thread: message_thread,
        author: author
    })
    .then(obj => {
        return obj
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to get all messages in specific thread
 * @param {integer} integer - message thread ID
 * @param {string} string - agent username
 * @param {string} string - user username
 * @returns {object} object - returning messages
 */
exports.getMessages = async function getMessages(threadId, agent, user) {
    let sql = ('SELECT message,author,date FROM messages m \
                JOIN message c ON c.id=\${id} \
                WHERE ((c.user_name=\${user}) AND (c.agent_name=\${agent})) ORDER BY date ASC;');
    let obj = await db.query(sql, 
        {
            id: threadId,
            agent: agent,
            user: user
        })
    .then(async obj => {
        // define array with messages
        let output = [];
        let decrypted = {};
        // define 0 value to iteration variable
        let i=0;
        // iteration to push decrypted message into array
        for (i; i < obj.length; i++) {
            // get current keys and values of message
            var keys = Object.keys(obj[i])
            var values = Object.values(obj[i])
            // clear object and iteration number
            decrypted = {};
            let x=0;
            // iteration to decrypt the values
            for (x; x < values.length; x++) {
                // if key is date or author, dont decrypt
                if (keys[x] !== 'message') {
                    decrypted[keys[x]] = values[x];
                    continue
                }
                // Perform decryption and store to the object
                else if (values.length > 0) {
                    decrypted[keys[x]] = crypt.decrypt(values[x]);
                }
            }
            // Push decrypted message to an array
            output.push(decrypted)
        }
        return output
    })
    .catch(e => console.error(e.stack));
    return obj
}

/**
 * Model to archive thread for user with USER ROLE
 * @param {integer} integer - message thread ID
 * @param {string} string - user username
 * @returns {boolean} boolean - returning true
 */
exports.archiveThreadUser = async function archiveThreadUser(thread_id, user) {
    let sql = 'UPDATE message SET archived_user=true \
               WHERE ((id=\${thread_id}) AND (user_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to un-archive thread for user with USER ROLE
 * @param {integer} integer - message thread ID
 * @param {string} string - user username
 * @returns {boolean} boolean - returning true
 */
exports.unArchiveThreadUser = async function unArchiveThreadUser(thread_id, user) {
    let sql = 'UPDATE message SET archived_user=false \
               WHERE ((id=\${thread_id}) AND (user_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to archive thread for user with AGENT ROLE
 * @param {integer} integer - message thread ID
 * @param {string} string - agent username
 * @returns {boolean} boolean - returning true
 */
exports.archiveThreadAgent = async function archiveThreadAgent(thread_id, user) {
    let sql = 'UPDATE message SET archived_agent=true \
               WHERE ((id=\${thread_id}) AND (agent_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to un-archive thread for user with AGENT ROLE
 * @param {integer} integer - message thread ID
 * @param {string} string - agent username
 * @returns {boolean} boolean - returning true
 */
exports.unArchiveThreadAgent = async function unArchiveThreadAgent(thread_id, user) {
    let sql = 'UPDATE message SET archived_agent=false \
               WHERE ((id=\${thread_id}) AND (agent_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to mark thread for deletion for user with USER ROLE, if both agent 
 * and user marked thread for deletion only then it will be deleted
 * @param {integer} integer - message thread ID
 * @param {string} string - user username
 * @returns {boolean} boolean - returning true
 */
exports.delThreadUser = async function delThreadUser(thread_id, user) {
    let sql = 'UPDATE message SET del_for_user=true \
               WHERE ((id=\${thread_id}) AND (user_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}

/**
 * Model to mark thread for deletion for user with AGENT ROLE
 * @param {integer} integer - message thread ID
 * @param {string} string - agent username
 * @returns {boolean} boolean - returning true
 */
exports.delThreadAgent = async function delThreadAgent(thread_id, user) {
    let sql = 'UPDATE message SET del_for_agent=true \
               WHERE ((id=\${thread_id}) AND (agent_name=\${user})) RETURNING true;'
    let obj = await db.query(sql, {
        thread_id: thread_id,
        user: user
    })
    .catch(e => console.error(e.stack))
    return obj;
}
/**
 * Model to delete thread and messages from DB when both agent/user marked thread for deletion
 * @param {integer} integer - message thread ID
 */
exports.deleteThreadAndMessages = async function deleteThreadAndMessages(thread_id) {
    let sql = 'DELETE FROM messages WHERE message_thread=$1; \
               DELETE FROM message WHERE id=$1;'
    let obj = await db.query(sql, thread_id)
    .catch(e => console.error(e.stack))
    return obj;
}