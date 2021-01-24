const table = require("../ldpos-table-schema").delegates;
const tableName = table.tableName;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.address, 80).notNullable();
            tbl.string(table.columns.voteWeight, 20).notNullable();
            tbl.bigInteger(table.columns.updateHeight).notNullable();
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
