const {accountsTable, transactionsTable, blocksTable, delegatesTable, ballotsTable} = require('../knex/ldpos-table-schema');
const {isNullOrUndefined} = require('./utils');

const applyParserForEach = (objects, ...parsers) => {
  return objects.map(obj => parsers.reduce((parsedObj, parser) => parser(parsedObj), obj));
};

// boolean parser for sqlite
const booleanParser = (obj, keys) => {
  for (key of keys) {
    if (key in obj && !isNullOrUndefined(obj[key])) {
      obj[key] = obj[key] === "1"
    }
  }
  return obj;
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

const textToArray = (obj, keys) => {
  for (key of keys) {
    if (key in obj && !isNullOrUndefined(obj[key])) {
      obj[key] = obj[key].split(',');
    }
  }
  return obj;
};


// can be converted into two types of parsers -> From & To parser
const accountsTableParser = (accounts) => {
  const bigIntegerFields = [
    accountsTable.field.lastTransactionTimestamp,
    accountsTable.field.updateHeight,
  ];

  const integerFields = [
    accountsTable.field.nextForgingKeyIndex,
    accountsTable.field.nextMultisigKeyIndex,
    accountsTable.field.nextSigKeyIndex,
    accountsTable.field.requiredSignatureCount,
  ]
  return applyParserForEach(accounts,
      (account) => numberParser(account, bigIntegerFields),
      (block) => numberParser(block, integerFields),
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

  const integerFields = [
      transactionsTable.field.indexInBlock,
      transactionsTable.field.requiredSignatureCount
  ]

  const base64Fields = [
    transactionsTable.field.signatures,
  ];
  const textArrayFields = [
    transactionsTable.field.memberAddresses,
  ];

  return applyParserForEach(transactions,
      sanitizeTransaction,
      (txn) => numberParser(txn, bigIntegerFields),
      (block) => numberParser(block, integerFields),
      (txn) => base64ObjParser(txn, base64Fields),
      (txn) => textToArray(txn, textArrayFields)
  );
};

const blocksTableParser = (blocks) => {
  const bigIntegerFields = [
    blocksTable.field.height,
    blocksTable.field.timestamp,
    blocksTable.field.nextForgingKeyIndex,
  ];

  const integerFields = [
      blocksTable.field.numberOfTransactions
  ]

  const booleanFields = [
      blocksTable.field.active
  ]

  const base64Fields = [
    blocksTable.field.signatures,
  ];

  return applyParserForEach(blocks,
      (block) => numberParser(block, bigIntegerFields),
      (block) => numberParser(block, integerFields),
      (block) => booleanParser(block, booleanFields),
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

const ballotsTableParser = (ballots) => {
  const booleanFields = [
    ballotsTable.field.active
  ]

  return applyParserForEach(ballots,
      (ballot) => booleanParser(ballot, booleanFields),
  );
};

const Parsers = {
  [accountsTable.name]: accountsTableParser,
  [transactionsTable.name]: transactionTableParser,
  [blocksTable.name]: blocksTableParser,
  [delegatesTable.name]: delegatesTableParser,
  [ballotsTable.name]: ballotsTableParser,
};

module.exports = Parsers;
