/**
* A module with defined access control policies to manipulate with properties
* @module permissions/propertiesAgent
* @author Filip Prosovsky
* @see routes/* where these ACLs are being used
*/

const AccessControl = require('role-acl');
const ac = new AccessControl();

/** Grant permission to agent */
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('read').on('properties');
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('update').on('properties');
ac.grant('agent').condition({Fn:'EQUALS', args: {'requester':'$.owner'}}).execute('delete').on('properties');
/** Handled agent_id in queries, no condition needed */
ac.grant('agent').execute('create').on('properties');

/** Forbid permissions to user */
ac.grant('user').execute('NON').on('properties')

/** Grant permission to admin */
ac.grant('admin').execute('*').on('properties');


/**
 * Models to check user role and compare to owner of data requested to perform specific operations
 * Compare does not apply to CREATE operation as that one is handled in routes
 * @param {object} object - requester data
 * @param {object} object - resource data
 * @returns {boolean} boolean - true/false
 */
exports.read = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.agent_id}).execute('read').sync().on('properties');

exports.update = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.agent_id}).execute('update').sync().on('properties');

exports.delete = (requester, data) =>
ac.can(requester.role).context({requester:requester.agentid, owner:data.agent_id}).execute('delete').sync().on('properties');

exports.create = (requester) =>
ac.can(requester.role).execute('create').sync().on('properties');