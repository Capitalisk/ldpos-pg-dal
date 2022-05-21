const crypto = require('crypto');

const ID_BYTE_SIZE = 20;

class DAL {
  constructor() {
    this.accounts = {};
    this.delegates = {};
    this.ballots = {};
    this.blocks = [];
    this.transactions = {};
    this.multisigMembers = {};
    this.store = {};
  }

  async init(options) {
    let { genesis } = options;
    let { accounts } = genesis;
    let multisigWalletList = genesis.multisigWallets || [];

    await Promise.all(
      accounts.map(async (accountInfo) => {
        let { votes, ...accountWithoutVotes } = accountInfo;
        let account = {
          ...accountWithoutVotes,
          type: accountWithoutVotes.type || 'sig',
          updateHeight: 0
        };
        await this.upsertAccount(account);
        if (account.forgingPublicKey) {
          await this.upsertDelegate({
            address: account.address,
            voteWeight: '0',
            forgingRewards: '0'
          });
        }
      })
    );

    for (let accountInfo of accounts) {
      let { votes } = accountInfo;
      for (let delegateAddress of votes) {
        await this.vote({
          id: crypto.randomBytes(ID_BYTE_SIZE).toString('hex'),
          voterAddress: accountInfo.address,
          delegateAddress
        });
        let delegate = await this.getDelegate(delegateAddress);
        let updatedVoteWeight = BigInt(delegate.voteWeight) + BigInt(accountInfo.balance);
        await this.upsertDelegate({
          address: delegateAddress,
          voteWeight: updatedVoteWeight.toString(),
          forgingRewards: '0'
        });
      }
    }

    await Promise.all(
      multisigWalletList.map(async (multisigWallet) => {
        await this.registerMultisigWallet(
          multisigWallet.address,
          multisigWallet.members,
          multisigWallet.requiredSignatureCount
        );
      })
    );
  }

  async saveItem(key, value) {
    this.store[key] = value;
  }

  async loadItem(key) {
    return this.store[key];
  }

  async upsertAccount(account) {
    let existingAccount = this.accounts[account.address];
    this.accounts[account.address] = {
      ...existingAccount,
      ...account
    };
  }

  async hasAccount(walletAddress) {
    return !!this.accounts[walletAddress];
  }

  async getAccount(walletAddress) {
    let account = this.accounts[walletAddress];
    if (!account) {
      let error = new Error(`Account ${walletAddress} did not exist`);
      error.name = 'AccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...account};
  }

  async getAccountsByBalance(offset, limit, order) {
    return this.sortByProperty(Object.values(this.accounts), 'balance', order, BigInt)
      .slice(offset, offset + limit);
  }

  async getAccountVotes(voterAddress) {
    let voterAccount = this.accounts[voterAddress];
    if (!voterAccount) {
      let error = new Error(`Voter ${voterAddress} did not exist`);
      error.name = 'VoterAccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    let voteSet = new Set();
    let voteList = Object.values(this.ballots).filter(
      currentBallot => (
        currentBallot.active &&
        currentBallot.type === 'vote' &&
        currentBallot.voterAddress === voterAddress
      )
    );
    for (let vote of voteList) {
      voteSet.add(vote.delegateAddress);
    }
    return [...voteSet];
  }

  async hasVoteForDelegate(voterAddress, delegateAddress) {
    return Object.values(this.ballots).some(
      ballot => (
        ballot.active &&
        ballot.type === 'vote' &&
        ballot.voterAddress === voterAddress &&
        ballot.delegateAddress === delegateAddress
      )
    );
  }

  async vote(ballot) {
    if (this.ballots[ballot.id]) {
      this.ballots[ballot.id] = {...ballot, type: 'vote', active: true};
      return;
    }
    let { voterAddress, delegateAddress } = ballot;
    let hasExistingVote = await this.hasVoteForDelegate(voterAddress, delegateAddress);
    if (hasExistingVote) {
      let error = new Error(
        `Voter ${voterAddress} has already voted for delegate ${delegateAddress}`
      );
      error.name = 'VoterAlreadyVotedForDelegateError';
      error.type = 'InvalidActionError';
      throw error;
    }
    let existingUnvoteBallots = Object.values(this.ballots).filter(
      currentBallot => (
        currentBallot.active &&
        currentBallot.type === 'unvote' &&
        currentBallot.voterAddress === voterAddress &&
        currentBallot.delegateAddress === delegateAddress
      )
    );
    for (let unvoteBallot of existingUnvoteBallots) {
      unvoteBallot.active = false;
    }
    this.ballots[ballot.id] = {...ballot, type: 'vote', active: true};
  }

  async unvote(ballot) {
    if (this.ballots[ballot.id]) {
      this.ballots[ballot.id] = {...ballot, type: 'unvote', active: true};
      return;
    }
    let { voterAddress, delegateAddress } = ballot;
    let existingVoteBallots = Object.values(this.ballots).filter(
      currentBallot => (
        currentBallot.active &&
        currentBallot.type === 'vote' &&
        currentBallot.voterAddress === voterAddress &&
        currentBallot.delegateAddress === delegateAddress
      )
    );
    let existingUnvoteBallot = Object.values(this.ballots).find(
      currentBallot => (
        currentBallot.active &&
        currentBallot.type === 'unvote' &&
        currentBallot.voterAddress === voterAddress &&
        currentBallot.delegateAddress === delegateAddress
      )
    );

    if (!existingVoteBallots.length || existingUnvoteBallot) {
      let error = new Error(
        `Voter ${voterAddress} could not unvote delegate ${delegateAddress} because it was not voting for it`
      );
      error.name = 'VoterNotVotingForDelegateError';
      error.type = 'InvalidActionError';
      throw error;
    }
    for (let voteBallot of existingVoteBallots) {
      voteBallot.active = false;
    }
    this.ballots[ballot.id] = {...ballot, type: 'unvote', active: true};
  }

  async registerMultisigWallet(multisigAddress, memberAddresses, requiredSignatureCount) {
    let multisigAccount = this.accounts[multisigAddress];
    if (!multisigAccount) {
      let error = new Error(
        `Account ${multisigAddress} did not exist for multisig wallet registration`
      );
      error.name = 'MultisigAccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    for (let memberAddress of memberAddresses) {
      let memberAccount = this.accounts[memberAddress];
      if (!memberAccount) {
        let error = new Error(
          `Account ${memberAddress} did not exist for multisig member registration`
        );
        error.name = 'MemberAccountDidNotExistError';
        error.type = 'InvalidActionError';
        throw error;
      }
      if (!memberAccount.multisigPublicKey) {
        let error = new Error(
          `Account ${memberAddress} was not registered for multisig so it cannot be a member of a multisig wallet`
        );
        error.name = 'MemberAccountWasNotRegisteredError';
        error.type = 'InvalidActionError';
        throw error;
      }
      if (memberAccount.type === 'multisig') {
        let error = new Error(
          `Account ${
            memberAddress
          } was a multisig wallet so it could not be registered as a member of another multisig wallet`
        );
        error.name = 'MemberAccountWasMultisigAccountError';
        error.type = 'InvalidActionError';
        throw error;
      }
    }
    multisigAccount.type = 'multisig';
    multisigAccount.requiredSignatureCount = requiredSignatureCount;
    this.multisigMembers[multisigAddress] = new Set(memberAddresses);
  }

  async getMultisigWalletMembers(multisigAddress) {
    let memberAddresses = this.multisigMembers[multisigAddress];
    if (!memberAddresses) {
      let error = new Error(
        `Address ${multisigAddress} is not registered as a multisig wallet`
      );
      error.name = 'MultisigAccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return [...memberAddresses];
  }

  async getLastBlock() {
    return {...this.blocks[this.blocks.length - 1]};
  }

  async getBlocksFromHeight(height, limit) {
    let blocks = await this.getSignedBlocksFromHeight(height, limit)
    return blocks.map(block => this.simplifyBlock(block));
  }

  async getSignedBlocksFromHeight(height, limit) {
    if (height < 1) {
      height = 1;
    }
    let startIndex = height - 1;
    return this.blocks
      .slice(startIndex, startIndex + limit)
      .map((block) => {
        return {...block};
      });
  }

  async getLastBlockAtTimestamp(timestamp) {
    let blockList = [...this.blocks];
    blockList.sort((blockA, blockB) => {
      if (blockA.timestamp > blockB.timestamp) {
        return -1;
      }
      if (blockA.timestamp < blockB.timestamp) {
        return 1;
      }
      return 0;
    });
    let block = blockList.find(block => block.timestamp <= timestamp);
    if (!block) {
      let error = new Error(
        `No block existed with timestamp less than or equal to ${timestamp}`
      );
      error.name = 'BlockDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return this.simplifyBlock(block);
  }

  async getBlocksBetweenHeights(fromHeight, toHeight, limit) {
    let selectedBlocks = [];
    for (let block of this.blocks) {
      if (block.height > fromHeight && block.height <= toHeight) {
        selectedBlocks.push(block);
        if (selectedBlocks.length >= limit) {
          break;
        }
      }
    }
    return selectedBlocks.map(block => this.simplifyBlock(block));
  }

  async getBlockAtHeight(height) {
    let block = await this.getSignedBlockAtHeight(height);
    return this.simplifyBlock(block);
  }

  async getSignedBlockAtHeight(height) {
    let block = this.blocks[height - 1];
    if (!block) {
      let error = new Error(
        `No block existed at height ${height}`
      );
      error.name = 'BlockDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...block};
  }

  async hasBlock(id) {
    return this.blocks.some(currentBlock => currentBlock.id === id);
  }

  async getBlock(id) {
    let block = this.blocks.find(currentBlock => currentBlock.id === id);
    if (!block) {
      let error = new Error(
        `No block existed with ID ${id}`
      );
      error.name = 'BlockDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...block};
  }

  async getBlocksByTimestamp(offset, limit, order) {
    return this.sortByProperty(this.blocks, 'timestamp', order)
      .slice(offset, offset + limit)
      .map(block => this.simplifyBlock(block));
  }

  async upsertBlock(block, synched) {
    let { transactions } = block;
    this.blocks[block.height - 1] = { ...block };
    let len = transactions.length;
    for (let i = 0; i < len; i++) {
      let txn = transactions[i];
      this.transactions[txn.id] = {
        ...txn,
        blockId: block.id,
        indexInBlock: i
      };
    }
  }

  async getMaxBlockHeight() {
    return this.blocks.length;
  }

  async hasTransaction(transactionId) {
    let transaction = this.transactions[transactionId];
    return !!transaction;
  }

  async getTransaction(transactionId) {
    let transaction = this.transactions[transactionId];
    if (!transaction) {
      let error = new Error(`Transaction ${transactionId} did not exist`);
      error.name = 'TransactionDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...transaction};
  }

  async getTransactionsByTimestamp(offset, limit, order) {
    return this.sortByProperty(Object.values(this.transactions), 'timestamp', order)
      .slice(offset, offset + limit)
      .map((transaction) => {
        return {...transaction};
      });
  }

  async getTransactionsFromBlock(blockId, offset, limit) {
    if (offset == null) {
      offset = 0;
    }
    let transactionList = Object.values(this.transactions);
    let blockTxns = transactionList.filter(
      transaction => transaction.blockId === blockId && transaction.indexInBlock >= offset
    );
    if (limit == null) {
      return blockTxns;
    }
    return blockTxns
      .slice(0, limit)
      .map((transaction) => {
        return {...transaction};
      });
  }

  async getInboundTransactions(walletAddress, fromTimestamp, offset, limit, order) {
    let transactionList = this.sortByProperty(Object.values(this.transactions), 'timestamp', order);

    let inboundTransactions = [];
    for (let transaction of transactionList) {
      if (
        transaction.recipientAddress === walletAddress &&
        (
          fromTimestamp == null ||
          (
            order === 'desc' ? transaction.timestamp <= fromTimestamp : transaction.timestamp >= fromTimestamp
          )
        )
      ) {
        inboundTransactions.push(transaction);
      }
    }
    return inboundTransactions.map((transaction) => {
      return {...transaction};
    }).slice(offset, offset + limit);
  }

  async getOutboundTransactions(walletAddress, fromTimestamp, offset, limit, order) {
    let transactionList = this.sortByProperty(Object.values(this.transactions), 'timestamp', order);
    let outboundTransactions = [];
    for (let transaction of transactionList) {
      if (
        transaction.senderAddress === walletAddress &&
        (
          fromTimestamp == null ||
          (
            order === 'desc' ? transaction.timestamp <= fromTimestamp : transaction.timestamp >= fromTimestamp
          )
        )
      ) {
        outboundTransactions.push(transaction);
      }
    }
    return outboundTransactions.map((transaction) => {
      return {...transaction};
    }).slice(offset, offset + limit);
  }

  async getInboundTransactionsFromBlock(walletAddress, blockId) {
    let transactionList = Object.values(this.transactions);
    return transactionList
      .filter(
        transaction => transaction.blockId === blockId && transaction.recipientAddress === walletAddress
      )
      .map((transaction) => {
        return {...transaction};
      });
  }

  async getOutboundTransactionsFromBlock(walletAddress, blockId) {
    let transactionList = Object.values(this.transactions);
    return transactionList
      .filter(
        transaction => transaction.blockId === blockId &&
        transaction.senderAddress === walletAddress
      )
      .map((transaction) => {
        return {...transaction};
      });
  }

  async upsertDelegate(delegate) {
    let existingDelegate = this.delegates[delegate.address];
    this.delegates[delegate.address] = {
      ...existingDelegate,
      ...delegate
    };
  }

  async hasDelegate(walletAddress) {
    return !!this.delegates[walletAddress];
  }

  async getDelegate(walletAddress) {
    let delegate = this.delegates[walletAddress];
    if (!delegate) {
      let error = new Error(`Delegate ${walletAddress} did not exist`);
      error.name = 'DelegateDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...delegate};
  }

  async getDelegateVoters(walletAddress, offset, limit, order) {
    let delegate = this.delegates[walletAddress];
    if (!delegate) {
      let error = new Error(`Delegate ${walletAddress} did not exist`);
      error.name = 'DelegateDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    let voterSet = new Set();
    let voteList = Object.values(this.ballots).filter(
      currentBallot => (
        currentBallot.active &&
        currentBallot.type === 'vote' &&
        currentBallot.delegateAddress === walletAddress
      )
    );
    for (let vote of voteList) {
      voterSet.add(vote.voterAddress);
    }
    return [...voterSet];
  }

  async getDelegatesByVoteWeight(offset, limit, order) {
    return this.sortByProperty(
      Object.values(this.delegates).filter(delegate => delegate.voteWeight !== '0'),
      'voteWeight',
      order,
      BigInt
    )
    .slice(offset, offset + limit)
    .map((delegate) => {
      return {...delegate};
    });
  }

  sortAsc(list, property, typeCastFunction) {
    return list.sort((a, b) => {
      let itemA;
      let itemB;
      if (typeCastFunction) {
        itemA = typeCastFunction(a[property]);
        itemB = typeCastFunction(b[property]);
      } else {
        itemA = a[property];
        itemB = b[property];
      }
      if (itemA > itemB) {
        return 1;
      }
      if (itemA < itemB) {
        return -1;
      }
      return 0;
    });
  }

  sortDesc(list, property, typeCastFunction) {
    return list.sort((a, b) => {
      let itemA;
      let itemB;
      if (typeCastFunction) {
        itemA = typeCastFunction(a[property]);
        itemB = typeCastFunction(b[property]);
      } else {
        itemA = a[property];
        itemB = b[property];
      }
      if (itemA > itemB) {
        return -1;
      }
      if (itemA < itemB) {
        return 1;
      }
      return 0;
    });
  }

  sortByProperty(list, property, order, typeCastFunction) {
    if (order === 'asc') {
      return this.sortAsc(list, property, typeCastFunction);
    }
    return this.sortDesc(list, property, typeCastFunction);
  }

  simplifyBlock(signedBlock) {
    let {transactions, forgerSignature, signatures, ...simpleBlock} = signedBlock;
    return simpleBlock;
  }
}

module.exports = DAL;
