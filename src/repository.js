const {findMatchingRecords, updateMatchingRecords, matchFound, noMatchFound, insert } = require("../knex/knex-helpers");
const {accountsTable, transactionsTable, blocksTable, delegatesTable, multisig_membershipsTable, ballotsTable} = require("../knex/ldpos-table-schema");
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
            const account = await findMatchingRecords(tableName, { [accountsTable.field.address]: address});
            return firstOrDefault(account, null);
        }
    }
})(accountsTable.name, accountsTable.field.address);

const transactionsRepo = (( tableName, ...primaryKeys) => {
    const transactionRepository = repository(tableName, primaryKeys);
    return {
        ...transactionRepository,
        getById : async (id) => {
            const transaction = await findMatchingRecords(tableName, {[transactionsTable.field.id]: id});
            return firstOrDefault(transaction, null);
        }
    }
})(transactionsTable.name, transactionsTable.field.id);

const blocksRepo = (( tableName, ...primaryKeys) => {
    const blocksRepository = repository(tableName, primaryKeys);
    return {
        ...blocksRepository,
        getBlockById : async(id) => {
            const block = await findMatchingRecords(tableName, {[blocksTable.field.id]: id});
            return firstOrDefault(block, null);
        }
    }
})(blocksTable.name, blocksTable.field.id);


const delegatesRepo = (( tableName, ...primaryKeys) => {
    const delegatesRepository = repository(tableName, primaryKeys);
    return {
        ...delegatesRepository,
        getByAddress : async (address) => {
            const delegate = await findMatchingRecords(tableName, {[delegatesTable.field.address]: address});
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
            return findMatchingRecords(tableName, multsigAccountAddressMatcher).map(ms => ms[multisig_membershipsTable.field.memberAddress]);
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
