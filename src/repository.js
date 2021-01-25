const {findMatchingRecords, updateMatchingRecords, matchFound, noMatchFound, insert } = require("../knex/knex-helpers");
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");
const { upsert } = require("../knex/pg-helpers");
const { firstOrDefault} = require("./utils")

// todo - convert all repo. to class and inherit from superclass repository

const accountsRepo = {
    get: () => findMatchingRecords(accounts.tableName, {}),
    getByAddress : async (address) => {
        const account = await findMatchingRecords(accounts.tableName, {[accounts.columns.address]: address});
        return firstOrDefault(account, null);
    },
    upsert: (account) => upsert(accounts.tableName, account, [accounts.columns.address])
}

const transactionsRepo = {
    getById : async (id) => {
        const transaction = await findMatchingRecords(transactions.tableName, {[transactions.columns.id]: id});
        return firstOrDefault(transaction, null);
    }
}

const blocksRepo = {
    getBlockById : async(id) => {
        const block = await findMatchingRecords(blocks.tableName, {[blocks.columns.id]: id});
        return firstOrDefault(block, null);
    }
}

const delegatesRepo = {
    get: () => findMatchingRecords(delegates.tableName, {}),
    getByAddress : async (address) => {
        const delegate = await findMatchingRecords(delegates.tableName, {[delegates.columns.address]: address});
        return firstOrDefault(delegate, null);
    },
    upsert: (delegate) => upsert(delegates.tableName, delegate, [delegates.columns.address]),
    exists: (matcher) => matchFound(delegates.tableName, matcher)
}

const multisigMembershipsRepo = {
    get: () => findMatchingRecords(multisig_memberships.tableName, {}),
    getMembersByMultsigAccountAddress : (address) => {
        const multsigAccountAddressMatcher = {[multisig_memberships.columns.multsigAccountAddress]: address};
        return findMatchingRecords(multisig_memberships.tableName, multsigAccountAddressMatcher).map(ms => ms[multisig_memberships.columns.memberAddress]);
    },
    insert: (multiSigMembership) => insert(multisig_memberships.tableName, multiSigMembership),
}

const ballotsRepo = {
    get: () => findMatchingRecords(ballots.tableName, {}),
    upsert: (ballot) => upsert(ballots.tableName, ballot, [ballots.columns.id]),
    updateMatching: (matcher, newValues) => updateMatchingRecords(ballots.tableName, matcher, newValues),
    exists: (matcher) => matchFound(ballots.tableName, matcher),
    notExist: (matcher) => noMatchFound(ballots.tableName, matcher)
}

module.exports = { accountsRepo, transactionsRepo, blocksRepo, delegatesRepo, multisigMembershipsRepo, ballotsRepo }
