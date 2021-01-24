const table = require("../ldpos-table-schema").votes;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.voterAddress, 80).notNullable();
            tbl.string(table.columns.delegateAddress, 80).notNullable()
            tbl.string(table.columns.transactionId, 44).notNullable();
            tbl.primary([table.columns.voterAddress, table.columns.delegateAddress]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
