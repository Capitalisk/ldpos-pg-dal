const genesis = {
  "networkSymbol": "ldpos",
  "accounts": [
    {
      "address": "ldpos313ac2d3d1d081901be0c5ce074d1e81a8a0bf5f",
      "type": "sig",
      "forgingPublicKey": "65afbf3e6e0f1b99bd595852ab59e9d54cd6ebffad3fb3608d6f084534938757",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "9cd1cb3923eaf015762a6a2c44f224004060f60e4b12c27f61489685742e1c11",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "313ac2d3d1d081901be0c5ce074d1e81a8a0bf5fe29515ac2d349cfa2f5b3b10",
      "nextSigKeyIndex": 0,
      "balance": "9999900000000000",
      "votes": ["ldpos313ac2d3d1d081901be0c5ce074d1e81a8a0bf5f"]
    },
    {
      "address": "ldpos5f0bc55450657f7fcb188e90122f7e4cee894199",
      "type": "sig",
      "forgingPublicKey": "8606386e5e972640d0d9c32cc5adc441744a780c18a0bbbf7b216fed58d8ccff",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "e6c87420fb00ac4cd1327dabcfcfea7c2a63d3cf93580c18de2282385d3d72b3",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "5f0bc55450657f7fcb188e90122f7e4cee894199c7b3213f4df74b3ea25aa56d",
      "nextSigKeyIndex": 0,
      "balance": "100000000000",
      "votes": ["ldpos313ac2d3d1d081901be0c5ce074d1e81a8a0bf5f"]
    },
    {
      "address": "ldposaed82ed3f324e738306301ca4d6b955580d4bc24",
      "type": "sig",
      "forgingPublicKey": "940dad3958110f265e66081283fedaa662f9108ef050fe1a1e1dc52212da1f2d",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "b6ea96faadde0980f560721d39566d638e47dca51d5ff1e1f725b2fcd28fc1c8",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "aed82ed3f324e738306301ca4d6b955580d4bc24333eb08357729cabedd54976",
      "nextSigKeyIndex": 0,
      "balance": "20000000000",
      "votes": ["ldpos313ac2d3d1d081901be0c5ce074d1e81a8a0bf5f"]
    },
    {
      "address": "ldpos6da4367efe495a14a8cc38064c61879cea884e60",
      "type": "multisig",
      "forgingPublicKey": "815da23015e9e41314a501653e3bf146cac4602a9219aa82a82bb62b1a8ea5b9",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "538485213b1ab9bb2d77fdcf25a334ba196944a084fd36c2984bb9c3400484a3",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "6da4367efe495a14a8cc38064c61879cea884e600d0075082fe9a565b6cbf8c4",
      "nextSigKeyIndex": 0,
      "balance": "30000000000",
      "votes": ["ldpos313ac2d3d1d081901be0c5ce074d1e81a8a0bf5f"]
    }
  ],
  "multisigWallets": [
    {
      "address": "ldpos6da4367efe495a14a8cc38064c61879cea884e60",
      "requiredSignatureCount": 2,
      "members": ["ldposaed82ed3f324e738306301ca4d6b955580d4bc24", "ldpos5f0bc55450657f7fcb188e90122f7e4cee894199"]
    }
  ]
};

module.exports = genesis;
