/**
* A module with defined access control policies to perform operations on categories
* @module permissions/categories
* @author Filip Prosovsky
* @see routes/* where these ACLs are being used
*/

const AccessControl = require('role-acl');
const ac = new AccessControl();

/** Grant permission to agent  */
ac.grant('agent').execute('create').on('category');
ac.grant('agent').execute('update').on('category', ['name', 'description', 'image_url']);
ac.grant('agent').execute('delete').on('category');
/** Forbid any permission to user */
ac.grant('user').execute('NON').on('category');
/** Grant admin all permissions */
ac.grant('admin').execute('*').on('category');

/**
 * Models to check user role to perform specific operations
 * @param {object} object - requester data
 * @returns {boolean} boolean - true/false
 */
exports.update = (requester) =>
ac.can(requester.role).execute('update').sync().on('category');

exports.create = (requester) =>
ac.can(requester.role).execute('create').sync().on('category');

exports.delete = (requester) =>
ac.can(requester.role).execute('delete').sync().on('category');