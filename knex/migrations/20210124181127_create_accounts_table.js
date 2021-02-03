const table = require("../ldpos-table-schema").accountsTable;
const tableName = table.name;

exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.address, 50).notNullable();
            tbl.string(table.field.type, 30).defaultTo("sig").notNullable();
            tbl.string(table.field.balance, 20).notNullable();
            tbl.string(table.field.forgingPublicKey, 64).nullable();
            tbl.bigInteger(table.field.nextForgingKeyIndex).nullable();
            tbl.string(table.field.multisigPublicKey, 64).nullable();
            tbl.bigInteger(table.field.nextMultisigKeyIndex).nullable();
            tbl.string(table.field.sigPublicKey, 64).nullable();
            tbl.bigInteger(table.field.nextSigKeyIndex).nullable();
            tbl.bigInteger(table.field.requiredSignatureCount).nullable();
            tbl.bigInteger(table.field.updateHeight).nullable();
            tbl.bigInteger(table.field.lastTransactionTimestamp).nullable();
            tbl.string(table.field.nextForgingPublicKey, 64).nullable();
            tbl.string(table.field.nextMultisigPublicKey, 64).nullable();
            tbl.string(table.field.nextSigPublicKey, 64).nullable();
            tbl.primary([table.field.address]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
