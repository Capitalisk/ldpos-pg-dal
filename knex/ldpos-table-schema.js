module.exports = {
    accountsTable : {
        name: "accounts",
        field: {
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
            updateHeight: "updateHeight",
            lastTransactionTimestamp: "lastTransactionTimestamp",
            nextForgingPublicKey: "nextForgingPublicKey",
            nextMultisigPublicKey: "nextMultisigPublicKey",
            nextSigPublicKey: "nextSigPublicKey"
        }
    },
    transactionsTable : {
        name: "transactions",
        field: {
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
    blocksTable : {
        name: "blocks",
        field : {
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
    ballotsTable : {
        name: "ballots",
        field: {
            id: "id", // matches transactionId
            type: "type",
            voterAddress: "voterAddress",
            delegateAddress: "delegateAddress",
            active: "active"
        }
    },
    delegatesTable : {
        name: "delegates",
        field: {
            address: "address",
            voteWeight: "voteWeight",
            updateHeight: "updateHeight"
        }
    },
    multisig_membershipsTable : {
        name: "multisig_memberships",
        field: {
            multsigAccountAddress: "multsigAccountAddress",
            memberAddress: "memberAddress"
        }
    },
    storeTable : {
        name: "store",
        field : {
            key: "key",
            value: "value"
        }
    }
}
