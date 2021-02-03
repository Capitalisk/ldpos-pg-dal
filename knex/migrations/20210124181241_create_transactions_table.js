const table = require("../ldpos-table-schema").transactionsTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.id, 40).notNullable();
            tbl.string(table.field.type, 30).notNullable();
            tbl.string(table.field.recipientAddress, 50).nullable();
            tbl.string(table.field.amount, 20).notNullable();
            tbl.string(table.field.fee, 20).notNullable();
            tbl.bigInteger(table.field.timestamp).notNullable();
            tbl.text(table.field.message).notNullable();
            tbl.string(table.field.senderAddress, 50).notNullable();
            tbl.string(table.field.sigPublicKey, 64).nullable();
            tbl.string(table.field.nextSigPublicKey, 64).nullable();
            tbl.bigInteger(table.field.nextSigKeyIndex).nullable();
            tbl.string(table.field.senderSignatureHash, 44).nullable();
            tbl.text(table.field.signatures).nullable();
            tbl.string(table.field.blockId, 40).notNullable();
            tbl.bigInteger(table.field.indexInBlock).notNullable();
            tbl.primary([table.field.id]);
        })
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
