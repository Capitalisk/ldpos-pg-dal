const table = require("../ldpos-table-schema").ballots;
const tableName = table.tableName;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.id, 44).notNullable();
            tbl.string(table.columns.type, 20).nullable();
            tbl.string(table.columns.voterAddress, 80).notNullable();
            tbl.string(table.columns.delegateAddress, 80).notNullable()
            tbl.boolean(table.columns.active).defaultTo(false).notNullable();
            tbl.primary([table.columns.id]);
            tbl.unique([table.columns.voterAddress, table.columns.delegateAddress]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
