const table = require('../ldpos-table-schema').transactionsTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (tbl) => {
    tbl.string(table.field.id, 40).primary().notNullable().index();
    tbl.string(table.field.type, 30).notNullable();
    tbl.string(table.field.recipientAddress, 50).nullable().index();
    tbl.bigInteger(table.field.amount).nullable();
    tbl.bigInteger(table.field.fee).notNullable();
    tbl.bigInteger(table.field.timestamp).notNullable().index();
    tbl.text(table.field.message).notNullable();
    tbl.string(table.field.senderAddress, 50).notNullable().index();
    tbl.string(table.field.sigPublicKey, 64).nullable();
    tbl.string(table.field.nextSigPublicKey, 64).nullable();
    tbl.bigInteger(table.field.nextSigKeyIndex).nullable();
    tbl.string(table.field.senderSignatureHash, 44).nullable();
    tbl.text(table.field.signatures).nullable();
    tbl.string(table.field.blockId, 40).notNullable().index();
    tbl.integer(table.field.indexInBlock).notNullable();
    tbl.string(table.field.delegateAddress, 50).nullable();
    tbl.string(table.field.newForgingPublicKey, 64).nullable();
    tbl.string(table.field.newNextForgingPublicKey, 64).nullable();
    tbl.bigInteger(table.field.newNextForgingKeyIndex).nullable();
    tbl.string(table.field.newMultisigPublicKey, 64).nullable();
    tbl.string(table.field.newNextMultisigPublicKey, 64).nullable();
    tbl.bigInteger(table.field.newNextMultisigKeyIndex).nullable();
    tbl.string(table.field.newSigPublicKey, 64).nullable();
    tbl.string(table.field.newNextSigPublicKey, 64).nullable();
    tbl.bigInteger(table.field.newNextSigKeyIndex).nullable();
    tbl.text(table.field.memberAddresses).nullable();
    tbl.integer(table.field.requiredSignatureCount).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
