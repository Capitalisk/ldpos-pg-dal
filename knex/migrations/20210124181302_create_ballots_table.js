const table = require('../ldpos-table-schema').ballotsTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (tbl) => {
    tbl.string(table.field.id, 44).primary().notNullable().index();
    tbl.string(table.field.type, 20).notNullable().index();
    tbl.string(table.field.voterAddress, 50).notNullable().index();
    tbl.string(table.field.delegateAddress, 50).notNullable().index();
    tbl.boolean(table.field.active).notNullable().index();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
