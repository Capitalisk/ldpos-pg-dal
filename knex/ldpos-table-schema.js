module.exports = {
    accounts : {
        tableName: "accounts",
        columns: {
            address : "address",
            type: "type",
            balance: "balance",
            forgingPublicKey: "forgingPublicKey",
            nextForgingKeyIndex: "nextForgingKeyIndex",
            multisigPublicKey: "multisigPublicKey",
            nextMultisigKeyIndex: "nextMultisigKeyIndex",
            sigPublicKey: "sigPublicKey",
            nextSigKeyIndex: "nextSigKeyIndex",
            requiredSignatureCount: "requiredSignatureCount",
            updateHeight: "updateHeight"
        }
    },
    transactions : {
        tableName: "transactions",
        columns: {
            id: "id",
            type: "type",
            recipientAddress: "recipientAddress",
            amount: "amount",
            fee: "fee",
            timestamp: "timestamp",
            message: "message",
            senderAddress: "senderAddress",
            sigPublicKey: "sigPublicKey",
            nextSigPublicKey: "nextSigPublicKey",
            nextSigKeyIndex: "nextSigKeyIndex",
            senderSignatureHash: "senderSignatureHash",
            signatures: "signatures",
            blockId: "blockId",
            indexInBlock: "indexInBlock"
        }
    },
    blocks : {
        tableName: "blocks",
        columns : {
            id: "id",
            height: "height",
            timestamp: "timestamp",
            previousBlockId: "previousBlockId",
            forgerAddress: "forgerAddress",
            forgingPublicKey: "forgingPublicKey",
            nextForgingPublicKey: "nextForgingPublicKey",
            nextForgingKeyIndex: "nextForgingKeyIndex",
            forgerSignature: "forgerSignature",
            signatures: "signatures",
            synched: "synched"
        }
    },
    votes : {
        tableName: "votes",
        columns: {
            voterAddress: "voterAddress",
            delegateAddress: "delegateAddress",
            transactionId: "transactionId"
        }
    },
    delegates : {
        tableName: "delegates",
        columns: {
            address: "address",
            voteWeight: "voteWeight",
            updateHeight: "updateHeight"
        }
    },
    multisig_memberships : {
        tableName: "multisig_memberships",
        columns: {
            multsigAccountAddress: "multsigAccountAddress",
            memberAddress: "memberAddress"
        }
    }
}
