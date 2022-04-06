const {
  applyParserForEach,
  base64ObjParser,
  numberParser,
  removePrivateBlockField,
  sanitizeTransaction,
  textToArray,
} = require('./parsers');

const {accountsTable, transactionsTable, blocksTable, delegatesTable, ballotsTable} = require('../../knex/ldpos-table-schema');

class DalParser {
  constructor(knexClient) {
    this.knexClient = knexClient;
    this.initializeParsers();
  }

  generateAccountsTableParsers() {
    let bigIntegerFields = [
      accountsTable.field.lastTransactionTimestamp,
      accountsTable.field.nextSigKeyIndex,
      accountsTable.field.nextForgingKeyIndex,
      accountsTable.field.nextMultisigKeyIndex,
      accountsTable.field.updateHeight,
    ];
    let parsers = [(account) => numberParser(account, bigIntegerFields)];

    return parsers;
  };

  generateTransactionTableParsers() {
    let bigIntegerFields = [
      transactionsTable.field.timestamp,
      transactionsTable.field.nextSigKeyIndex,
      transactionsTable.field.newNextForgingKeyIndex,
      transactionsTable.field.newNextMultisigKeyIndex,
      transactionsTable.field.newNextSigKeyIndex,
    ];

    let base64Fields = [
      transactionsTable.field.signatures,
      transactionsTable.field.error,
    ];
    let textArrayFields = [
      transactionsTable.field.memberAddresses,
    ];

    let parsers = [
      sanitizeTransaction,
      (txn) => numberParser(txn, bigIntegerFields),
      (txn) => base64ObjParser(txn, base64Fields),
      (txn) => textToArray(txn, textArrayFields),
    ];

    return parsers;
  };

  generateBlocksTableParser() {
    let bigIntegerFields = [
      blocksTable.field.height,
      blocksTable.field.timestamp,
      blocksTable.field.nextForgingKeyIndex,
    ];

    let base64Fields = [
      blocksTable.field.signatures,
    ];

    let parsers = [
      (block) => numberParser(block, bigIntegerFields),
      (block) => base64ObjParser(block, base64Fields),
      removePrivateBlockField,
    ];

    return parsers;
  };

  generateDelegatesTableParser() {
    let bigIntegerFields = [delegatesTable.field.updateHeight];
    return [
      (delegate) => numberParser(delegate, bigIntegerFields),
    ];
  };

  initializeParsers() {
    this.accountTableParsers = this.generateAccountsTableParsers();
    this.transactionsTableParsers = this.generateTransactionTableParsers();
    this.blocksTableParsers = this.generateBlocksTableParser();
    this.delegatesTableParsers = this.generateDelegatesTableParser();
  };

  getRecordedParsers() {
    let recordedParsers = {
      [accountsTable.name]: (accounts) => applyParserForEach(accounts, ...this.accountTableParsers),
      [transactionsTable.name]: (transactions) => applyParserForEach(transactions, ...this.transactionsTableParsers),
      [blocksTable.name]: (blocks) => applyParserForEach(blocks, ...this.blocksTableParsers),
      [delegatesTable.name]: (delegates) => applyParserForEach(delegates, ...this.delegatesTableParsers),
    };
    return recordedParsers;
  };
}

module.exports = DalParser;
