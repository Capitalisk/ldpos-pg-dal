const {isLocal} = require('../src/utils');
const environment = process.env.ENVIRONMENT || 'development';
const config = require('../knexfile.js')[environment];

var types = require('pg').types;

// todo - need to check if parseInt satisfy bigint requirement
types.setTypeParser(20, function (val) {
  return parseInt(val, 10);
});

const knex = require('knex')(config);
if (isLocal(environment)) {
  knex.on('query', (...args) => {
    if (process.env.KNEX_DEBUG) {
      console.info(args);
    }
  });
}
module.exports = knex;
