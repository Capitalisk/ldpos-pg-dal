const table = require('../ldpos-table-schema').blocksTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (tbl) => {
    tbl.string(table.field.id, 40).primary().notNullable().index();
    tbl.bigInteger(table.field.height).notNullable().unique().index();
    tbl.bigInteger(table.field.timestamp).notNullable().index();
    tbl.string(table.field.previousBlockId, 40).nullable();
    tbl.string(table.field.forgerAddress, 50).notNullable().index();
    tbl.string(table.field.forgingPublicKey, 64).notNullable();
    tbl.string(table.field.nextForgingPublicKey, 64).notNullable();
    tbl.bigInteger(table.field.nextForgingKeyIndex).notNullable();
    tbl.string(table.field.forgerSignature, 32984).notNullable();
    tbl.text(table.field.signatures).notNullable();
    tbl.boolean(table.field.synched).nullable();
    tbl.integer(table.field.numberOfTransactions);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
