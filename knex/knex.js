import {isLocal} from "../utils";
const environment = process.env.ENVIRONMENT || 'development'
const config = require('../knexfile.js')[environment];
const knex = require('knex')(config);
if (isLocal(environment)) {
    knex.on('query', (...args) => console.info(args));
}
module.exports = knex;
