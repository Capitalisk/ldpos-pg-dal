module.exports = {
    accounts : {
        name: "accounts",
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
        name: "transactions",
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
        name: "blocks",
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
        name: "votes",
        columns: {
            voterAddress: "voterAddress",
            delegateAddress: "delegateAddress",
            transactionId: "transactionId"
        }
    },
    delegates : {
        name: "delegates",
        columns: {
            address: "address",
            voteWeight: "voteWeight",
            updateHeight: "updateHeight"
        }
    },
    multisig_memberships : {
        name: "multisig_memberships",
        columns: {
            multsigAccountAddress: "multsigAccountAddress",
            memberAddress: "memberAddress"
        }
    }
}
