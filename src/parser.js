const {accountsTable, transactionsTable, blocksTable, delegatesTable} = require('../knex/ldpos-table-schema');
const {isNullOrUndefined} = require('./utils');

const applyParserForEach = (objects, ...parsers) => {
  return objects.map(obj => parsers.reduce((parsedObj, parser) => parser(parsedObj), obj));
};

// responsible for parsing string into bigInteger values
const numberParser = (obj, keys) => {
  for (key of keys) {
    if (key in obj && !isNullOrUndefined(obj[key])) {
      obj[key] = parseInt(obj[key], 10);
    }
  }
  return obj;
};

const base64ObjParser = (obj, keys) => {
  for (key of keys) {
    if (key in obj && !isNullOrUndefined(obj[key])) {
      obj[key] = JSON.parse(
        Buffer.from(obj[key], 'base64').toString('utf8')
      );
    }
  }
  return obj;
};

const sanitizeTransaction = (txn) => {
    let props = Object.keys(txn);
    for (let prop of props) {
      if (txn[prop] == null) {
        delete txn[prop];
      }
    }
    return txn;
};

const removePrivateBlockField = (block) => {
    delete block.synched;
    return block;
};

// can be converted into two types of parsers -> From & To parser
const accountsTableParser = (accounts) => {
  const bigIntegerFields = [
    accountsTable.field.lastTransactionTimestamp,
    accountsTable.field.updateHeight,
  ];
  return applyParserForEach(accounts,
      (account) => numberParser(account, bigIntegerFields)
  );
};

const transactionTableParser = (transactions) => {
  const bigIntegerFields = [
    transactionsTable.field.timestamp,
    transactionsTable.field.nextSigKeyIndex,
    transactionsTable.field.newNextForgingKeyIndex,
    transactionsTable.field.newNextMultisigKeyIndex,
    transactionsTable.field.newNextSigKeyIndex,
  ];
  const base64Fields = [
    transactionsTable.field.signatures,
  ];

  return applyParserForEach(transactions,
      sanitizeTransaction,
      (txn) => numberParser(txn, bigIntegerFields),
      (txn) => base64ObjParser(txn, base64Fields)
  );
};

const blocksTableParser = (blocks) => {
  const bigIntegerFields = [
    blocksTable.field.height,
    blocksTable.field.timestamp,
    blocksTable.field.nextForgingKeyIndex,
  ];
  const base64Fields = [
    blocksTable.field.signatures,
  ];
  return applyParserForEach(blocks,
      (block) => numberParser(block, bigIntegerFields),
      (block) => base64ObjParser(block, base64Fields),
      removePrivateBlockField
  );
};

const delegatesTableParser = (delegates) => {
  const bigIntegerFields = [delegatesTable.field.updateHeight];
  return applyParserForEach(delegates,
      (delegate) => numberParser(delegate, bigIntegerFields)
  );
};

const Parsers = {
  [accountsTable.name]: accountsTableParser,
  [transactionsTable.name]: transactionTableParser,
  [blocksTable.name]: blocksTableParser,
  [delegatesTable.name]: delegatesTableParser,
};

module.exports = Parsers;
