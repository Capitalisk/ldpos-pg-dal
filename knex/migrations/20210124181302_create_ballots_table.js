const table = require("../ldpos-table-schema").ballotsTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.id, 44).notNullable();
            tbl.string(table.field.type, 20).notNullable();
            tbl.string(table.field.voterAddress, 80).notNullable();
            tbl.string(table.field.delegateAddress, 80).notNullable()
            tbl.boolean(table.field.active).defaultTo(true).notNullable();
            tbl.primary([table.field.id]);
            tbl.unique([table.field.voterAddress, table.field.delegateAddress]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
