const table = require("../ldpos-table-schema").multisig_memberships;
const tableName = table.name;

exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.multsigAccountAddress, 80).notNullable();
            tbl.string(table.columns.memberAddress, 80).notNullable();
            tbl.primary([table.columns.multsigAccountAddress,table.columns.memberAddress]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
