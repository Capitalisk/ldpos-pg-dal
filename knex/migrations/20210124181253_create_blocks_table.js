const table = require("../ldpos-table-schema").blocks;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.id, 44).unique();
            tbl.bigInteger(table.columns.height).notNullable();
            tbl.bigInteger(table.columns.timestamp).notNullable();
            tbl.string(table.columns.previousBlockId, 44).notNullable();
            tbl.string(table.columns.forgerAddress, 80).notNullable();
            tbl.string(table.columns.forgingPublicKey, 44).notNullable();
            tbl.string(table.columns.nextForgingPublicKey, 44).notNullable();
            tbl.bigInteger(table.columns.nextForgingKeyIndex).notNullable();
            tbl.string(table.columns.forgerSignature, 32984).notNullable();
            tbl.text(table.columns.signatures).notNullable();
            tbl.boolean(table.columns.synched).defaultTo(false);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
