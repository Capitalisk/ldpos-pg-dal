const {isLocal} = require('../src/utils');
const environment = process.env.ENVIRONMENT || 'development';
const config = require('../knexfile.js')[environment];

// Needed if BigInt values need to be converted to integer from string
// var types = require('pg').types;
// types.setTypeParser(20, function (val) {
//   return parseInt(val, 10);
// });

const knex = require('knex')(config);
if (isLocal(environment)) {
  knex.on('query', (...args) => {
    if (process.env.KNEX_DEBUG) {
      console.info(args);
    }
  });
}
module.exports = knex;
