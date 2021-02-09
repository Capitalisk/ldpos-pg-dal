const {accountsTable, transactionsTable, blocksTable, delegatesTable} = require('../knex/ldpos-table-schema');
const {isNullOrUndefined} = require('./utils');

// responsible for parsing string into bigInteger values
const parse = (objects, keys) => {
    const mapper = (obj) => {
        for (key of keys) {
            if (key in obj && !isNullOrUndefined(obj[key])) {
                obj[key] = parseInt(obj[key], 10);
            }
        }
        return obj;
    };
    return objects.map(mapper);
};

// can be converted into two types of parsers -> From & To parser
const accountsTableParser = (accounts) => {
    const bigIntegerFields = [
        accountsTable.field.lastTransactionTimestamp,
        accountsTable.field.updateHeight,
    ];
    return parse(accounts, bigIntegerFields);
};

const transactionTableParser = (transactions) => {
    const bigIntegerFields = [
        transactionsTable.field.timestamp,
        transactionsTable.field.nextSigKeyIndex,
        transactionsTable.field.newNextForgingKeyIndex,
        transactionsTable.field.newNextMultisigKeyIndex,
        transactionsTable.field.newNextSigKeyIndex,
    ];
    return parse(transactions, bigIntegerFields);
};

const blocksTableParser = (blocks) => {
    const bigIntegerFields = [
        blocksTable.field.height,
        blocksTable.field.timestamp,
        blocksTable.field.nextForgingKeyIndex,
    ];
    return parse(blocks, bigIntegerFields);
};

const delegatesTableParser = (delegates) => {
    const bigIntegerFields = [delegatesTable.field.updateHeight];
    return parse(delegates, bigIntegerFields);
};

const Parsers = {
    [accountsTable.name] : accountsTableParser,
    [transactionsTable.name] : transactionTableParser,
    [blocksTable.name] : blocksTableParser,
    [delegatesTable.name] : delegatesTableParser,
};

module.exports = Parsers;
