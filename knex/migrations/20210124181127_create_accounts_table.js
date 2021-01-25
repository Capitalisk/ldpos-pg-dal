const table = require("../ldpos-table-schema").accountsTable;
const tableName = table.name;

exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.address, 80).notNullable();
            tbl.string(table.field.type, 30).defaultTo("sig").notNullable();
            tbl.string(table.field.balance, 20).notNullable();
            tbl.string(table.field.forgingPublicKey, 44).notNullable();
            tbl.bigInteger(table.field.nextForgingKeyIndex).notNullable();
            tbl.string(table.field.multisigPublicKey, 44).notNullable();
            tbl.bigInteger(table.field.nextMultisigKeyIndex).notNullable();
            tbl.string(table.field.sigPublicKey, 44).notNullable();
            tbl.bigInteger(table.field.nextSigKeyIndex).notNullable();
            tbl.bigInteger(table.field.requiredSignatureCount).nullable();
            tbl.bigInteger(table.field.updateHeight).notNullable();
            tbl.primary([table.field.address]);
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
