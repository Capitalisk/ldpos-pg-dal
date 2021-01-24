const table = require("../ldpos-table-schema").transactions;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.id, 44).unique();
            tbl.string(table.columns.type, 30).notNullable();
            tbl.string(table.columns.recipientAddress, 80).nullable();
            tbl.string(table.columns.amount, 20).notNullable();
            tbl.string(table.columns.fee, 20).notNullable();
            tbl.bigInteger(table.columns.timestamp).notNullable();
            tbl.text(table.columns.message).notNullable();
            tbl.string(table.columns.senderAddress, 80).notNullable();
            tbl.string(table.columns.sigPublicKey, 44).notNullable();
            tbl.string(table.columns.nextSigPublicKey, 44).notNullable();
            tbl.bigInteger(table.columns.nextSigKeyIndex).notNullable();
            tbl.string(table.columns.senderSignatureHash, 44).nullable();
            tbl.text(table.columns.signatures).nullable();
            tbl.string(table.columns.blockId, 44).notNullable();
            tbl.bigInteger(table.columns.indexInBlock).notNullable();
        })
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
