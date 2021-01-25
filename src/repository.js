const {findMatchingRecords, updateMatchingRecords, matchFound, noMatchFound, insert } = require("../knex/knex-helpers");
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");
const { upsert } = require("../knex/pg-helpers");
const { firstOrDefault} = require("./utils")

const repository = (tableName, ...primaryKeys) => ({
    get: () => findMatchingRecords(tableName, {}),
    insert: (data) => insert(tableName, data),
    update: (matcher, updatedData) => updateMatchingRecords(tableName, matcher, updatedData),
    upsert: (data) => upsert(tableName, data, primaryKeys),
    exists: (matcher) => matchFound(tableName, matcher),
    notExist: (matcher) => noMatchFound(tableName, matcher)
});

const accountsRepo = (( tableName, ...primaryKeys) => {
    const accountsRepository = repository(tableName, primaryKeys);
    return {
        ...accountsRepository,
        getByAddress : async (address) => {
            const account = await findMatchingRecords(tableName, { [accounts.columns.address]: address});
            return firstOrDefault(account, null);
        }
    }
})(accounts.tableName, accounts.columns.address);

const transactionsRepo = (( tableName, ...primaryKeys) => {
    const transactionRepository = repository(tableName, primaryKeys);
    return {
        ...transactionRepository,
        getById : async (id) => {
            const transaction = await findMatchingRecords(tableName, {[transactions.columns.id]: id});
            return firstOrDefault(transaction, null);
        }
    }
})(transactions.tableName, transactions.columns.id);

const blocksRepo = (( tableName, ...primaryKeys) => {
    const blocksRepository = repository(tableName, primaryKeys);
    return {
        ...blocksRepository,
        getBlockById : async(id) => {
            const block = await findMatchingRecords(tableName, {[blocks.columns.id]: id});
            return firstOrDefault(block, null);
        }
    }
})(blocks.tableName, blocks.columns.id);


const delegatesRepo = (( tableName, ...primaryKeys) => {
    const delegatesRepository = repository(tableName, primaryKeys);
    return {
        ...delegatesRepository,
        getByAddress : async (address) => {
            const delegate = await findMatchingRecords(tableName, {[delegates.columns.address]: address});
            return firstOrDefault(delegate, null);
        },
    }
})(delegates.tableName, delegates.columns.address);


const multisigMembershipsRepo = (( tableName, ...primaryKeys) => {
    const multisigMembershipsRepository = repository(tableName, primaryKeys);
    return {
        ...multisigMembershipsRepository,
        getMembersByMultsigAccountAddress : (address) => {
            const multsigAccountAddressMatcher = {[multisig_memberships.columns.multsigAccountAddress]: address};
            return findMatchingRecords(tableName, multsigAccountAddressMatcher).map(ms => ms[multisig_memberships.columns.memberAddress]);
        },
    }
})(multisig_memberships.tableName, multisig_memberships.columns.multsigAccountAddress, multisig_memberships.columns.memberAddress);

const ballotsRepo = (( tableName, ...primaryKeys) => {
    const ballotsRepository = repository(tableName, primaryKeys);
    return {
        ...ballotsRepository
    }
})(ballots.tableName, ballots.columns.id);

module.exports = { accountsRepo, transactionsRepo, blocksRepo, delegatesRepo, multisigMembershipsRepo, ballotsRepo }
