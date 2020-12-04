/**
* A module with defined access control policies to perform operations on messages
* @module permissions/messages
* @author Filip Prosovsky
* @see routes/* where these ACLs are being used
*/

const AccessControl = require('role-acl');
const ac = new AccessControl();


/** Grant permission to agent  */
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
    .execute('read').on('thread')
    .execute('update').on('thread')
    .execute('delete').on('thread')
    .execute('read').on('messages')
    .execute('create').on('messages');

/** Grant permission to user  */
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}})
    .execute('read').on('thread')
    .execute('update').on('thread')
    .execute('delete').on('thread')
    .execute('read').on('messages')
    .execute('create').on('messages');

/** Grant permission to admin  */
ac.grant('admin').execute('*').on('thread');
ac.grant('admin').execute('*').on('messages');


/**
 * Models to check user role and compare to owner of data requested to perform specific operations
 * @param {object} object - requester data
 * @param {object} object - resource data
 * @returns {boolean} boolean - true/false
 */
exports.readThreads = (requester, data) =>
ac.can(requester.role).context({requester:requester.user, owner:data[`${requester.role}`+`_name`]})
    .execute('read').sync().on('thread');

exports.readMessages = (requester, data) =>
ac.can(requester.role).context({requester:requester.user, owner:data[`${requester.role}`+`_name`]})
    .execute('read').sync().on('messages');

exports.send = (requester, data) =>
ac.can(requester.role).context({requester:requester.user, owner:data[`${requester.role}`+`_name`]})
    .execute('create').sync().on('messages');

exports.update = (requester, data) =>
ac.can(requester.role).context({requester:requester.user, owner:data[`${requester.role}`+`_name`]})
    .execute('update').sync().on('thread');

exports.delete = (requester, data) =>
ac.can(requester.role).context({requester:requester.user, owner:data[`${requester.role}`+`_name`]})
    .execute('delete').sync().on('thread');

