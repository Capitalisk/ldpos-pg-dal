const genesis = {
  "networkSymbol": "ldpos",
  "accounts": [
    {
      "address": "ldposfacd5ebf967ebd87436bd5932a58168b9a1151e3",
      "forgingPublicKey": "351b1c997046484dc443e2f728a4479d8523a3b7f088c577f628177e639ef2b1",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "3ee9d5e74aa178ed7c6af4feb77430973c279a751be162cd3f669144b4a72fa2",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "facd5ebf967ebd87436bd5932a58168b9a1151e3ccfbb9bda9a8ab6cb546675e",
      "nextSigKeyIndex": 0,
      "balance": "9999900000000000",
      "votes": ["ldposfacd5ebf967ebd87436bd5932a58168b9a1151e3"]
    },
    {
      "address": "ldpos1f4db4c3ae469a987776493d47a81a70c245ed00",
      "forgingPublicKey": "54ec095ccd226f0684bc0409ee488900a583e8cd82fd3a539972ae49f97dee69",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "a2d6e3024059ca92409911e0ad8308011f39c9278662f27ba7e32e1d777326dd",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "1f4db4c3ae469a987776493d47a81a70c245ed00c9d4dd7ea5e6f39bde04a3d5",
      "nextSigKeyIndex": 0,
      "balance": "100000000000",
      "votes": ["ldposfacd5ebf967ebd87436bd5932a58168b9a1151e3"]
    },
    {
      "address": "ldpos367429ac94d4204823fba7e79076d794ee0144c5",
      "forgingPublicKey": "3fe1987760f452b9750a10cebbb5475d09e1d9e75f9504a3d5a721dd38b6de7d",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "0e4080ae13026c64806c9d0ac19f9b57ff7cad433aca0bb45c09ad5fdd2c3f52",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "367429ac94d4204823fba7e79076d794ee0144c524afa5992ed22d793b630215",
      "nextSigKeyIndex": 0,
      "balance": "20000000000",
      "votes": ["ldposfacd5ebf967ebd87436bd5932a58168b9a1151e3"]
    },
    {
      "address": "ldpos3689799460f1aa80689bfd81bbd20314b616b88e",
      "forgingPublicKey": "b8b98a0377834a874de371720c02de73cabf8ed9680aebf65c752754639b5709",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "55425dcce138c051f77eb99ee6510e28a54c47464a4461bf4a047fc6708467f1",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "3689799460f1aa80689bfd81bbd20314b616b88e7eaf45f732b06883dc09486d",
      "nextSigKeyIndex": 0,
      "balance": "30000000000",
      "votes": ["ldposfacd5ebf967ebd87436bd5932a58168b9a1151e3"]
    }
  ],
  "multisigWallets": [
    {
      "address": "ldpos3689799460f1aa80689bfd81bbd20314b616b88e",
      "requiredSignatureCount": 2,
      "members": ["ldpos367429ac94d4204823fba7e79076d794ee0144c5", "ldpos1f4db4c3ae469a987776493d47a81a70c245ed00"]
    }
  ]
}

module.exports = genesis;
