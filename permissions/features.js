/**
* A module with defined access control policies to perform operations on features
* @module permissions/features
* @author Filip Prosovsky
* @see routes/* where these ACLs are being used
*/

const AccessControl = require('role-acl');
const ac = new AccessControl();

/** Grant permission to agent  */
ac.grant('agent').execute('create').on('feature');
ac.grant('agent').execute('update').on('feature');
ac.grant('agent').execute('delete').on('feature');

/** Forbid any permission to user */
ac.grant('user').execute('NON').on('feature');

/** Grant admin all permissions */
ac.grant('admin').execute('*').on('feature');

/**
 * Models to check user role to perform specific operation
 * @param {object} object - requester data
 * @returns {boolean} boolean - true/false
 */
exports.update = (requester) =>
ac.can(requester.role).execute('update').sync().on('feature');

exports.create = (requester) =>
ac.can(requester.role).execute('create').sync().on('feature');

exports.delete = (requester) =>
ac.can(requester.role).execute('delete').sync().on('feature');