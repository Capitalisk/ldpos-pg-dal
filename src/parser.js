const {accountsTable, transactionsTable, blocksTable, delegatesTable} = require('../knex/ldpos-table-schema');
const {isNullOrUndefined} = require('./utils');

// responsible for parsing string into bigInteger values
const parseAsNumber = (objects, keys) => {
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

const parseBase64AsObject = (objects, keys) => {
  const mapper = (obj) => {
    for (key of keys) {
      if (key in obj && !isNullOrUndefined(obj[key])) {
        obj[key] = JSON.parse(
          Buffer.from(obj[key], 'base64').toString('utf8')
        );
      }
    }
    return obj;
  };
  return objects.map(mapper);
};

const removePrivateBlockFields = (blocks) => {
  const mapper = (block) => {
    delete block.synched;
    return block;
  };
  return blocks.map(mapper);
};

// can be converted into two types of parsers -> From & To parser
const accountsTableParser = (accounts) => {
  const bigIntegerFields = [
    accountsTable.field.lastTransactionTimestamp,
    accountsTable.field.updateHeight,
  ];
  return parseAsNumber(accounts, bigIntegerFields);
};

const transactionTableParser = (transactions) => {
  const bigIntegerFields = [
    transactionsTable.field.timestamp,
    transactionsTable.field.nextSigKeyIndex,
    transactionsTable.field.newNextForgingKeyIndex,
    transactionsTable.field.newNextMultisigKeyIndex,
    transactionsTable.field.newNextSigKeyIndex,
  ];
  parseAsNumber(transactions, bigIntegerFields);
  const base64Fields = [
    transactionsTable.field.signatures,
  ];
  return parseBase64AsObject(transactions, base64Fields);
};

const blocksTableParser = (blocks) => {
  const bigIntegerFields = [
    blocksTable.field.height,
    blocksTable.field.timestamp,
    blocksTable.field.nextForgingKeyIndex,
  ];
  parseAsNumber(blocks, bigIntegerFields);
  const base64Fields = [
    transactionsTable.field.signatures,
  ];
  parseBase64AsObject(blocks, base64Fields);
  // Just remove unused properties which are just there for analysis purposes.
  return removePrivateBlockFields(blocks);
};

const delegatesTableParser = (delegates) => {
  const bigIntegerFields = [delegatesTable.field.updateHeight];
  return parseAsNumber(delegates, bigIntegerFields);
};

const Parsers = {
  [accountsTable.name]: accountsTableParser,
  [transactionsTable.name]: transactionTableParser,
  [blocksTable.name]: blocksTableParser,
  [delegatesTable.name]: delegatesTableParser,
};

module.exports = Parsers;
