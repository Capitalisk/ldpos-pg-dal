const table = require("../ldpos-table-schema").multisig_membershipsTable;
const tableName = table.name;

exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.multsigAccountAddress, 80).notNullable();
            tbl.string(table.field.memberAddress, 80).notNullable();
            tbl.primary([table.field.multsigAccountAddress,table.field.memberAddress]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
