/**
* A module with defined JWT strategy to be used in routes except login
* @module strategies/jwt
* @author Filip Prosovsky
* @see /routes /* where this strategy is used (except login)
*/

const passportJWT = require('passport-jwt');
require('dotenv').config();
const agent = require('../models/agents');
const JWTStrategy = passportJWT.Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;

/**
 * A model to load opts and extract bearer token from header.
 * Check if token is valid and based on that return done
 * @returns {(null | boolean | object)} 
 * (null,boolean|object) - if authenticated return payload, if not, return false
 */
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secret
opts.issuer = 'jwt.localhost';
opts.audience = 'localhost';

const strategy = new JWTStrategy(opts, 
  async function(jwt_payload, done){
    let user = await agent.viewAgentByUsername(jwt_payload.user)
    if ((user[0].username === jwt_payload.user) && (user[0].id === jwt_payload.agentid)) {
      return done(null, jwt_payload);
    } 
    else {
      return done(null, false);
    }
});
module.exports = strategy;