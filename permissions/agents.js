/**
* A module with defined access control policies to perform operations on user profiles
* @module permissions/agents
* @author Filip Prosovsky
* @see routes/* where these ACLs are being used
*/

const AccessControl = require('role-acl');
const ac = new AccessControl();


/**  View agents own profile */
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('read')
.on('agents', ['*', '!password', '!passwordSalt']);
/**  Read user own profile */
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('read')
.on('agents', ['*', '!password', '!passwordSalt']);

/**  update agents info */
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('update')
.on('agents', ['about','firstname','lastname','picture_url','phone','password', 'passwordSalt']);
/** update user info */
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('update')
.on('agents', ['about','firstname','lastname','picture_url','phone', 'password', 'passwordSalt']);

/** Delete avatar */
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('delete')
.on('agents', ['picture_url']);
/** Delete avatar */
ac.grant('user').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('delete')
.on('agents', ['picture_url']);


/** RWD ADMIN */
ac.grant('admin').execute('read').on('agents');
ac.grant('admin').execute('update').on('agents');
/** Not allowed to delete himself */
ac.grant('admin').condition({Fn:'NOT_EQUALS', args:
{'requester':'$.owner'}}).execute('delete').on('agents');

/**
 * Model to check if user can perform specific operations
 * @param {object} object - requester data
 * @param {object} object - resource data
 * @returns {boolean} boolean - true/false
 */
exports.read = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.id}).execute('read').sync().on('agents');

exports.update = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.id}).execute('update').sync().on('agents');

exports.delete = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.id}).execute('delete').sync().on('agents');