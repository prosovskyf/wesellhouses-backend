/**
* A module creating connection to PostgreSQL DB instance
* @module helpers/db
* @author Filip Prosovsky
* @see models/* for the models that require this module
*/
require('dotenv').config();
const pgp = require('pg-promise')();

/**  Connection variables */
const cn = {
    host: process.env.host,
    port: process.env.port,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password
};
/** Database connection with specified connection variable options */
const db = pgp(cn);

module.exports = db;