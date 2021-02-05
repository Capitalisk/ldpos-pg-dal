const table = require("../ldpos-table-schema").transactionsTable;
const tableName = table.name;
exports.up = function(knex) {
    return Promise.resolve(
        knex.schema.createTable(tableName, (tbl) => {
            tbl.string(table.field.id, 40).notNullable();
            tbl.string(table.field.type, 30).notNullable();
            tbl.string(table.field.recipientAddress, 50).nullable();
            tbl.string(table.field.amount, 20).nullable();
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
            // new nullable fields added
            tbl.string(table.field.delegateAddress, 50).nullable();
            tbl.string(table.field.newForgingPublicKey, 64).nullable();
            tbl.string(table.field.newNextForgingPublicKey, 64).nullable();
            tbl.bigInteger(table.field.newNextForgingKeyIndex).nullable();
            tbl.string(table.field.newMultisigPublicKey, 64).nullable();
            tbl.string(table.field.newNextMultisigPublicKey, 64).nullable();
            tbl.bigInteger(table.field.newNextMultisigKeyIndex).nullable();
            tbl.string(table.field.newSigPublicKey, 64).nullable();
            tbl.string(table.field.newNextSigPublicKey, 64).nullable();
            tbl.bigInteger(table.field.newNextSigKeyIndex).nullable();
            // todo : need to check if specific type can be kept as text/json ( JSON serialized)
            tbl.specificType(table.field.memberAddresses,'text ARRAY').nullable();
            tbl.bigInteger(table.field.requiredSignatureCount).nullable();
            tbl.primary([table.field.id]);
        })
    )
};

exports.down = function(knex) {
    return Promise.resolve(knex.schema.dropTable(tableName));
};
