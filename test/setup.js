const {run} = require('../src/utils');
const knex = require('../knex/knex');
const {accountsTable, transactionsTable, blocksTable, delegatesTable, multisig_membershipsTable, ballotsTable, storeTable} = require('../knex/ldpos-table-schema');
const accountsData = require('./fixtures/accounts');
const transactionsData = require('./fixtures/transactions');
const blocksData = require('./fixtures/blocks');
const delegatesData = require('./fixtures/delegates');
const multisig_membershipsData = require('./fixtures/multisig_memberships');
const ballotsData = require('./fixtures/ballots');
const storeData = require('./fixtures/store');

const fixture = (tableName, data) => ({
  tableName,
  data,
});

const FIXTURES = {
  accounts: fixture(accountsTable.name, accountsData),
  transactions: fixture(transactionsTable.name, transactionsData),
  blocks: fixture(blocksTable.name, blocksData),
  delegates: fixture(delegatesTable.name, delegatesData),
  multisig_memberships: fixture(multisig_membershipsTable.name, multisig_membershipsData),
  ballots: fixture(ballotsTable.name, ballotsData),
  store: fixture(storeTable.name, storeData)
};

const insert = ({tableName, data}) => Promise.resolve(knex(tableName).insert(data));

const truncate = ({tableName}) => Promise.resolve(knex(tableName).truncate());

const destroyConnection = () => Promise.resolve(knex.destroy());

const setupFixtures = (...fixtures) => run(insert, ...fixtures);

const tearDownFixtures = (...fixtures) => run(truncate, ...fixtures);

const tearDownAllFixtures = () => tearDownFixtures(...Object.values(FIXTURES));

const tearDownFixturesAndDestroyConnection = (...fixtures) => tearDownFixtures(...fixtures).then(destroyConnection);

const tearDownAllFixturesAndDestroyConnection = () => tearDownAllFixtures().then(destroyConnection);

module.exports = {fixture, insert, truncate, destroyConnection, setupFixtures, tearDownFixtures, tearDownFixturesAndDestroyConnection, tearDownAllFixturesAndDestroyConnection, tearDownAllFixtures, FIXTURES};
