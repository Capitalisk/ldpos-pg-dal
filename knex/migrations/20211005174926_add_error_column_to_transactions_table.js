const table = require('../ldpos-table-schema').transactionsTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.alterTable(tableName, (tbl) => {
    tbl.text(table.field.error).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable(tableName, (tbl) => {
    tbl.dropColumn(table.field.error);
  });
};
