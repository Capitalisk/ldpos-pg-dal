const table = require("../ldpos-table-schema").blocksTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.id, 44).unique();
            tbl.bigInteger(table.field.height).notNullable().unique();
            tbl.bigInteger(table.field.timestamp).notNullable();
            tbl.string(table.field.previousBlockId, 44).notNullable();
            tbl.string(table.field.forgerAddress, 80).notNullable();
            tbl.string(table.field.forgingPublicKey, 44).notNullable();
            tbl.string(table.field.nextForgingPublicKey, 44).notNullable();
            tbl.bigInteger(table.field.nextForgingKeyIndex).notNullable();
            tbl.string(table.field.forgerSignature, 32984).notNullable();
            tbl.text(table.field.signatures).notNullable();
            tbl.boolean(table.field.synched).defaultTo(false);
            tbl.primary([table.field.id]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
