const {findMatchingRecords, updateMatchingRecords, matchFound, noMatchFound, insert, findMatchingRecordsCount, buildEqualityMatcherQuery } = require("../knex/knex-helpers");
const {accountsTable, transactionsTable, blocksTable, delegatesTable, multisig_membershipsTable, ballotsTable, storeTable} = require("../knex/ldpos-table-schema");
const { upsert } = require("../knex/pg-helpers");

// todo - advanced matcher should be implemented based on requirement

const repository = (tableName, ...primaryKeys) => {

    const basicRepositoryOps = (defaultMatcher) =>
        ({
            get: (equalityMatcher = defaultMatcher) => findMatchingRecords(tableName, equalityMatcher),
            update: (updatedData, equalityMatcher = defaultMatcher) => updateMatchingRecords(tableName, equalityMatcher, updatedData),
            exists: (equalityMatcher = defaultMatcher) => matchFound(tableName, equalityMatcher),
            notExist: (equalityMatcher = defaultMatcher) => noMatchFound(tableName, equalityMatcher),
            count: (equalityMatcher = defaultMatcher) => findMatchingRecordsCount(tableName, equalityMatcher),
        })

    const generateFieldOps = (fieldName) => ({
        [fieldName]: (value) => basicRepositoryOps({[fieldName]: value})
    })

    const primaryKeyOps = primaryKeys.reduce((o, key) => ({ ...o, ...generateFieldOps(key)}), {});

    return {
        insert: (data) => insert(tableName, data),
        upsert: (data, byColumns = primaryKeys) => upsert(tableName, data, byColumns),
        ...basicRepositoryOps({}),
        ...primaryKeyOps,
        buildBaseQuery: (equalityMatcher = {}) => buildEqualityMatcherQuery(tableName, equalityMatcher),
    };
};

const ballotsRepo = repository(ballotsTable.name, ballotsTable.field.id);
const accountsRepo = repository(accountsTable.name, accountsTable.field.address);
const transactionsRepo = repository(transactionsTable.name, transactionsTable.field.id);
const blocksRepo = repository(blocksTable.name, blocksTable.field.id);
const delegatesRepo = repository(delegatesTable.name, delegatesTable.field.address);
const multisigMembershipsRepo = (( tableName, ...primaryKeys) => {
    const msmRepo = repository(tableName, primaryKeys);
    return {
        ...msmRepo,
        multsigAccountAddress : (address) => ({
            ...msmRepo.multsigAccountAddress(address),
            get : () => msmRepo.multsigAccountAddress(address).get().then(r => r. map(a => a[primaryKeys[1]]))
        })
    }
})(multisig_membershipsTable.name, multisig_membershipsTable.field.multsigAccountAddress, multisig_membershipsTable.field.memberAddress);
const storeRepo = repository(storeTable.name, storeTable.field.key);

module.exports = { accountsRepo, transactionsRepo, blocksRepo, delegatesRepo, multisigMembershipsRepo, ballotsRepo, storeRepo }
