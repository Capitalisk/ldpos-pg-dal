const table = require('../ldpos-table-schema').multisigMembershipsTable;
const tableName = table.name;

exports.up = function (knex) {
  return knex.schema.createTable(tableName, (tbl) => {
    tbl.string(table.field.multsigAccountAddress, 50).notNullable().index();
    tbl.string(table.field.memberAddress, 50).notNullable().index();
    tbl.primary([table.field.multsigAccountAddress,table.field.memberAddress]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable(tableName);
};
