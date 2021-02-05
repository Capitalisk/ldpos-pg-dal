const table = require("../ldpos-table-schema").delegatesTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.address, 50).notNullable();
            tbl.bigInteger(table.field.voteWeight).notNullable();
            tbl.bigInteger(table.field.updateHeight).nullable();
            tbl.primary([table.field.address]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
