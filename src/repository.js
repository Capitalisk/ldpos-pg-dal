const {findMatchingRecords, updateMatchingRecords, matchFound, noMatchFound, insert, buildEqualityMatcherQuery } = require("../knex/knex-helpers");
const {accountsTable, transactionsTable, blocksTable, delegatesTable, multisig_membershipsTable, ballotsTable} = require("../knex/ldpos-table-schema");
const { upsert } = require("../knex/pg-helpers");
const { firstOrDefault} = require("./utils")

// todo - advanced matcher should be implemented based on requirement

const repository = (tableName, ...primaryKeys) => ({
    get: (equalityMatcher = {}) => findMatchingRecords(tableName, equalityMatcher),
    insert: (data) => insert(tableName, data),
    update: (updatedData, equalityMatcher = {}) => updateMatchingRecords(tableName, equalityMatcher, updatedData),
    upsert: (data) => upsert(tableName, data, primaryKeys),
    exists: (equalityMatcher = {}) => matchFound(tableName, equalityMatcher),
    notExist: (equalityMatcher= {}) => noMatchFound(tableName, equalityMatcher),
    buildBaseQuery: (equalityMatcher = {}) => buildEqualityMatcherQuery(tableName, equalityMatcher),
});

const accountsRepo = (( tableName, ...primaryKeys) => {
    const accountsRepository = repository(tableName, primaryKeys);
    return {
        ...accountsRepository,
        getByAddress : async (address) => {
            const account = await accountsRepository.get({ [accountsTable.field.address]: address});
            return firstOrDefault(account, null);
        }
    }
})(accountsTable.name, accountsTable.field.address);

const transactionsRepo = (( tableName, ...primaryKeys) => {
    const transactionRepository = repository(tableName, primaryKeys);
    return {
        ...transactionRepository,
        getById : async (id) => {
            const transaction = await transactionRepository.get({[transactionsTable.field.id]: id});
            return firstOrDefault(transaction, null);
        }
    }
})(transactionsTable.name, transactionsTable.field.id);

const blocksRepo = (( tableName, ...primaryKeys) => {
    const blocksRepository = repository(tableName, primaryKeys);
    return {
        ...blocksRepository,
        getBlockById : async(id) => {
            const block = await blocksRepository.get({[blocksTable.field.id]: id});
            return firstOrDefault(block, null);
        }
    }
})(blocksTable.name, blocksTable.field.id);


const delegatesRepo = (( tableName, ...primaryKeys) => {
    const delegatesRepository = repository(tableName, primaryKeys);
    return {
        ...delegatesRepository,
        getByAddress : async (address) => {
            const delegate = await delegatesRepository.get({[delegatesTable.field.address]: address});
            return firstOrDefault(delegate, null);
        },
    }
})(delegatesTable.name, delegatesTable.field.address);


const multisigMembershipsRepo = (( tableName, ...primaryKeys) => {
    const multisigMembershipsRepository = repository(tableName, primaryKeys);
    return {
        ...multisigMembershipsRepository,
        getMembersByMultsigAccountAddress : (address) => {
            const multsigAccountAddressMatcher = {[multisig_membershipsTable.field.multsigAccountAddress]: address};
            return multisigMembershipsRepository.get(multsigAccountAddressMatcher).map(ms => ms[multisig_membershipsTable.field.memberAddress]);
        },
    }
})(multisig_membershipsTable.name, multisig_membershipsTable.field.multsigAccountAddress, multisig_membershipsTable.field.memberAddress);

const ballotsRepo = (( tableName, ...primaryKeys) => {
    const ballotsRepository = repository(tableName, primaryKeys);
    return {
        ...ballotsRepository
    }
})(ballotsTable.name, ballotsTable.field.id);

module.exports = { accountsRepo, transactionsRepo, blocksRepo, delegatesRepo, multisigMembershipsRepo, ballotsRepo }
