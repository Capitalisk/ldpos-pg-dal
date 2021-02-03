const table = require("../ldpos-table-schema").blocksTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.id, 40).unique();
            tbl.bigInteger(table.field.height).notNullable().unique();
            tbl.bigInteger(table.field.timestamp).notNullable();
            tbl.string(table.field.previousBlockId, 40).nullable();
            tbl.string(table.field.forgerAddress, 50).notNullable();
            tbl.string(table.field.forgingPublicKey, 64).notNullable();
            tbl.string(table.field.nextForgingPublicKey, 64).notNullable();
            tbl.bigInteger(table.field.nextForgingKeyIndex).notNullable();
            tbl.string(table.field.forgerSignature, 32984).notNullable();
            tbl.text(table.field.signatures).notNullable();
            tbl.boolean(table.field.synched).defaultTo(false);
            tbl.bigInteger(table.field.numberOfTransactions);
            tbl.primary([table.field.id]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
