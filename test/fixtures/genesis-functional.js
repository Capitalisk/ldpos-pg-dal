const genesis = {
  "networkSymbol": "ldpos",
  "accounts": [
    {
      "address": "092188ca7934529fc624acf62f2b6ce96c3167424f54aa467428f3d0dcdcc60cldpos",
      "forgingPublicKey": "mw26bjrYNk+8hIdx2WRwLJWrSqdnjaKSrhii0lQBtUU=",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "3F3oIqWtMpJcf/hLIpCIsbRmCQYYLLVEn4wsmICXKXM=",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "CSGIynk0Up/GJKz2Lyts6WwxZ0JPVKpGdCjz0Nzcxgw=",
      "nextSigKeyIndex": 0,
      "balance": "9999900000000000",
      "votes": ["092188ca7934529fc624acf62f2b6ce96c3167424f54aa467428f3d0dcdcc60cldpos"]
    },
    {
      "address": "660c22683a6d466f66740042677ed1adc8bb723bd871c32c93f52eaa224a817fldpos",
      "forgingPublicKey": "VyMOMKKy63KLCA1YkqTjaBZnlm5wdk0TOVu2LmAfAK0=",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "xreuBmWlBA/6og9dXjIkiiH7BHISFRBXIks3AFAzrmc=",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "ZgwiaDptRm9mdABCZ37Rrci7cjvYccMsk/UuqiJKgX8=",
      "nextSigKeyIndex": 0,
      "balance": "100000000000",
      "votes": ["092188ca7934529fc624acf62f2b6ce96c3167424f54aa467428f3d0dcdcc60cldpos"]
    },
    {
      "address": "859d1e3fe282683bc9e88475cb3389551f72e9b70c9436aea3acd757c2718326ldpos",
      "forgingPublicKey": "y8jXJxfY+/zJ1QWxyJysm4dDOhKoKUapdW8Ts6i51NE=",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "KM9MknfcNTNiTv69lqivBRl0PaRrghya8AZ79myQfzI=",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "hZ0eP+KCaDvJ6IR1yzOJVR9y6bcMlDauo6zXV8JxgyY=",
      "nextSigKeyIndex": 0,
      "balance": "20000000000",
      "votes": ["092188ca7934529fc624acf62f2b6ce96c3167424f54aa467428f3d0dcdcc60cldpos"]
    },
    {
      "address": "ea87e8bf7de70528b70bd9ef4d22c2169815bd2e9a1b35ce7905cb2255cbc2celdpos",
      "forgingPublicKey": "8+hwAt7OTMyfZtsj3ZmJSZj7RDxGiFnUyOgbI9JN6WA=",
      "nextForgingKeyIndex": 0,
      "multisigPublicKey": "Z8W38bLWd8ppg3xP4EipnggM2c3Z/35/NaNm8TpsthY=",
      "nextMultisigKeyIndex": 0,
      "sigPublicKey": "6ofov33nBSi3C9nvTSLCFpgVvS6aGzXOeQXLIlXLws4=",
      "nextSigKeyIndex": 0,
      "balance": "30000000000",
      "votes": ["092188ca7934529fc624acf62f2b6ce96c3167424f54aa467428f3d0dcdcc60cldpos"]
    }
  ],
  "multisigWallets": [
    {
      "address": "ea87e8bf7de70528b70bd9ef4d22c2169815bd2e9a1b35ce7905cb2255cbc2celdpos",
      "requiredSignatureCount": 2,
      "members": ["859d1e3fe282683bc9e88475cb3389551f72e9b70c9436aea3acd757c2718326ldpos", "660c22683a6d466f66740042677ed1adc8bb723bd871c32c93f52eaa224a817fldpos"]
    }
  ]
}

module.exports = genesis;
