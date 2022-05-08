const table = require('../ldpos-table-schema').storeTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (tbl) => {
    tbl.string(table.field.key, 100).primary().index();
    tbl.text(table.field.value);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
