const table = require("../ldpos-table-schema").accounts;
const tableName = table.name;

exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.columns.address, 80).notNullable();
            tbl.string(table.columns.type, 30).defaultTo("sig").notNullable();
            tbl.string(table.columns.balance, 20).notNullable();
            tbl.string(table.columns.forgingPublicKey, 20).notNullable();
            tbl.bigInteger(table.columns.nextForgingKeyIndex).notNullable();
            tbl.string(table.columns.multisigPublicKey, 44).notNullable();
            tbl.bigInteger(table.columns.nextMultisigKeyIndex).notNullable();
            tbl.string(table.columns.sigPublicKey, 44).notNullable();
            tbl.bigInteger(table.columns.nextSigKeyIndex).notNullable();
            tbl.bigInteger(table.columns.requiredSignatureCount).notNullable();
            tbl.bigInteger(table.columns.updateHeight).notNullable();
        }),
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
