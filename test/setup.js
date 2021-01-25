const {run} = require("../utils");
const knex = require('../knex/knex');
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");
const accountsData = require("./fixtures/accounts")
const transactionsData = require("./fixtures/transactions")
const blocksData = require("./fixtures/blocks")
const delegatesData = require("./fixtures/delegates")
const multisig_membershipsData = require("./fixtures/multisig_memberships")
const ballotsData = require("./fixtures/ballots")

const fixture = (tableName, data) => ({
    tableName,
    data,
});
const insert = ({tableName, data}) => Promise.resolve(knex(tableName).insert(data));

const truncate = ({tableName}) => Promise.resolve(knex(tableName).truncate());

const destroyConnection = ()=> Promise.resolve(knex.destroy());

const setupFixtures = (...fixtures) => run(insert, ...fixtures);

const tearDownFixtures = (...fixtures) => run(truncate, ...fixtures);

const tearDownFixturesAndDestroyConnection = (...fixtures) => tearDownFixtures(...fixtures).then(destroyConnection);

const tearDownAllFixturesAndDestroyConnection = () => tearDownFixtures(...Object.values(FIXTURES)).then(destroyConnection);

const FIXTURES = {
    accounts: fixture( accounts.tableName, accountsData),
    transactions: fixture( transactions.tableName, transactionsData),
    blocks: fixture( blocks.tableName, blocksData),
    delegates: fixture( delegates.tableName, delegatesData),
    multisig_memberships: fixture( multisig_memberships.tableName, multisig_membershipsData),
    ballots: fixture( ballots.tableName, ballotsData),
};

module.exports = {fixture, insert, truncate, destroyConnection, setupFixtures, tearDownFixtures, tearDownFixturesAndDestroyConnection, tearDownAllFixturesAndDestroyConnection, FIXTURES}
