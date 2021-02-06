const knex = require('../knex/knex')
const crypto = require('crypto');
const {firstOrNull, isEmpty} = require('./utils')
const {ballotsTable, multisig_membershipsTable, blocksTable, accountsTable, delegatesTable, transactionsTable, storeTable} = require('../knex/ldpos-table-schema');
const {areTablesEmpty}  = require('../knex/pg-helpers');
const {accountsRepo, ballotsRepo, multisigMembershipsRepo, transactionsRepo, delegatesRepo, blocksRepo, storeRepo} = require('./repository')
const DEFAULT_NETWORK_SYMBOL = 'ldpos';
const ID_BYTE_SIZE = 20;
// todo - constructor and init can be refined
class DAL {

  constructor() {}

  async init(options) {
    await knex.migrate.latest();

    let {genesis} = options;
    let {accounts} = genesis;
    let multisigWalletList = genesis.multisigWallets || [];
    this.networkSymbol = genesis.networkSymbol || DEFAULT_NETWORK_SYMBOL;

    if (await areTablesEmpty()) {
      await Promise.all(
        accounts.map(async (accountInfo) => {
          let {votes, ...accountWithoutVotes} = accountInfo;
          let account = {
            ...accountWithoutVotes,
            type: 'sig',
            updateHeight: 0,
          };
          await this.upsertAccount(account);
          if (account.forgingPublicKey) {
            await this.upsertDelegate({
              address: account.address,
              voteWeight: '0',
            });
          }
        })
      );

      for (let accountInfo of accounts) {
        let {votes} = accountInfo;
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
            voteWeight: updatedVoteWeight.toString()
          });
        }
      }

      await Promise.all(
        multisigWalletList.map(async (multisigWallet) => {
          await this.registerMultisigWallet(
            multisigWallet.address,
            multisigWallet.members,
            multisigWallet.requiredSignatureCount,
          );
        })
      );
    }
  }

  async saveItem(key, value) {
    const item = {
      [storeTable.field.key]: key,
      [storeTable.field.value]: value,
    };
    await storeRepo.upsert(item);
  }

  async loadItem(key) {
    const keyValuePair = firstOrNull(await storeRepo.key(key).get());
    return keyValuePair ? keyValuePair[storeTable.field.value] : null;
  }

  async getNetworkSymbol() {
    return this.networkSymbol;
  }

  async upsertAccount(account) {
    await accountsRepo.upsert(account);
  }


  async hasAccount(walletAddress) {
    return await accountsRepo.address(walletAddress).exists();
  }

  async getAccount(walletAddress) {
    const account = firstOrNull(await accountsRepo.address(walletAddress).get());
    if (!account) {
      let error = new Error(`Account ${walletAddress} did not exist`);
      error.name = 'AccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...account};
  }

  async getAccountsByBalance(offset, limit, order) {
    return accountsRepo.buildBaseQuery()
      .orderBy(accountsTable.field.balance, order)
      .offset(offset)
      .limit(limit);
  }

  async getAccountVotes(voterAddress) {
    if (await accountsRepo.address(voterAddress).notExist()) {
      let error = new Error(`Voter ${voterAddress} did not exist`);
      error.name = 'VoterAccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    const activeVotesMatcher = {
      [ballotsTable.field.active]: true,
      [ballotsTable.field.type]: 'vote',
      [ballotsTable.field.voterAddress]: voterAddress,
    };
    const ballots = await ballotsRepo.get(activeVotesMatcher);
    return ballots.map(ballot => ballot[ballotsTable.field.delegateAddress]);
  }

  async hasVoteForDelegate(voterAddress, delegateAddress) {
    const existingVotesMatcher = {
      [ballotsTable.field.active]: true,
      [ballotsTable.field.type]: 'vote',
      [ballotsTable.field.voterAddress]: voterAddress,
      [ballotsTable.field.delegateAddress]: delegateAddress,
    };
    return await ballotsRepo.exists(existingVotesMatcher);
  }

  async vote(ballot) {
    const { id, voterAddress, delegateAddress } = ballot;
    if (await ballotsRepo.id(id).notExist()) {
      const hasExistingVote = await this.hasVoteForDelegate(voterAddress, delegateAddress);
      if (hasExistingVote) {
        let error = new Error(
          `Voter ${voterAddress} has already voted for delegate ${delegateAddress}`
        );
        error.name = 'VoterAlreadyVotedForDelegateError';
        error.type = 'InvalidActionError';
        throw error;
      }
      const existingUnvotesMatcher = {
        [ballotsTable.field.active]: true,
        [ballotsTable.field.type]: 'unvote',
        [ballotsTable.field.voterAddress]: voterAddress,
        [ballotsTable.field.delegateAddress]: delegateAddress,
      }
      const markInactive = {[ballotsTable.field.active]: false};
      await ballotsRepo.update(markInactive, existingUnvotesMatcher);
    }
    ballot = {...ballot, type: 'vote', active: true};
    await ballotsRepo.upsert(ballot);
  }

  async unvote(ballot) {
    const { id, voterAddress, delegateAddress } = ballot;

    if (await ballotsRepo.id(id).notExist()) {
      const existingVotesMatcher = {
        [ballotsTable.field.active]: true,
        [ballotsTable.field.type]: 'vote',
        [ballotsTable.field.voterAddress]: voterAddress,
        [ballotsTable.field.delegateAddress]: delegateAddress,
      };

      const existingUnvotesMatcher = {
        [ballotsTable.field.active]: true,
        [ballotsTable.field.type]: 'unvote',
        [ballotsTable.field.voterAddress]: voterAddress,
        [ballotsTable.field.delegateAddress]: delegateAddress,
      };

      const hasNoExistingVotes = await ballotsRepo.notExist(existingVotesMatcher);
      const hasExistingUnvotes = await ballotsRepo.exists(existingUnvotesMatcher);

      if (hasNoExistingVotes || hasExistingUnvotes) {
        let error = new Error(
          `Voter ${voterAddress} could not unvote delegate ${delegateAddress} because it was not voting for it`
        );
        error.name = 'VoterNotVotingForDelegateError';
        error.type = 'InvalidActionError';
        throw error;
      }

      const markInactive = {[ballotsTable.field.active]: false};
      await ballotsRepo.update(markInactive, existingVotesMatcher);
    }
    ballot = {...ballot,  type: 'unvote', active: true};
    await ballotsRepo.upsert(ballot);
  }

  async registerMultisigWallet(multisigAddress, memberAddresses, requiredSignatureCount) {
    const multisigAccount = await this.getAccount(multisigAddress);
    for (let memberAddress of memberAddresses) {
      let memberAccount = await this.getAccount(memberAddress);
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
    await this.upsertAccount(multisigAccount);

    for (let memberAddress of memberAddresses) {
      const multiSigMembership = {
        [multisig_membershipsTable.field.multsigAccountAddress]: multisigAddress,
        [multisig_membershipsTable.field.memberAddress]: memberAddress,
      };
      await multisigMembershipsRepo.upsert(multiSigMembership);
    }
  }

  async getMultisigWalletMembers(multisigAddress) {
    let memberAddresses = await multisigMembershipsRepo.multsigAccountAddress(multisigAddress).get();
    if (isEmpty(memberAddresses)) {
      let error = new Error(
        `Address ${multisigAddress} is not registered as a multisig wallet`
      );
      error.name = 'MultisigAccountDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return [...memberAddresses];
  }

  // Need to check based on what get last block
  async getLastBlock() {
     const matchingBlocks = await blocksRepo.buildBaseQuery()
       .orderBy(blocksTable.field.height, 'desc')
       .limit(1);
     return firstOrNull(matchingBlocks);
  }

  async getBlocksFromHeight(height, limit) {
    // todo : is it possible that this scenario might come
    if (height < 1) {
      height = 1;
    }
    let offset = height - 1;
    return blocksRepo.buildBaseQuery()
      .offset(offset)
      .limit(limit);
  }

  async getSignedBlocksFromHeight(height, limit) {
    const blocks = await this.getBlocksFromHeight(height, limit);
    return Promise.all(blocks.map(this.simplifyBlock));
  }

  async getLastBlockAtTimestamp(timestamp) {
    const blocks = await blocksRepo.buildBaseQuery()
      .where(blocksTable.field.timestamp, '<=', timestamp);
    const block = firstOrNull(blocks);
    if (!block) {
      let error = new Error(
        `No block existed with timestamp less than or equal to ${timestamp}`
      );
      error.name = 'BlockDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...block};
  }

  async getBlocksBetweenHeights(fromHeight, toHeight, limit) {
    return blocksRepo.buildBaseQuery()
      .where(blocksTable.field.height, '>', fromHeight)
      .andWhere(blocksTable.field.height, '<=', toHeight)
      .limit(limit);
  }

  async getBlockAtHeight(height) {
    const heightMatcher = {[blocksTable.field.height]: height};
    const block = firstOrNull(await blocksRepo.get(heightMatcher));
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

  // todo : Need to check this again, if this is index based or field based
  async getSignedBlockAtHeight(height) {
    const block = await this.getBlockAtHeight(height);
    return await this.simplifyBlock(block);
  }

  async hasBlock(id) {
    return await blocksRepo.id(id).exists();
  }

  async getBlock(id) {
    const block = firstOrNull(blocksRepo.id(id).get());
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
    return blocksRepo.buildBaseQuery()
      .orderBy(blocksTable.field.timestamp, order)
      .offset(offset)
      .limit(limit);
  }

  // todo for update operations, return number of records updated
  // todo check what are index based operations
  // todo what is synched field being used for
  // todo check if height based upsert can be replaced with id
  async upsertBlock(block, synched) {
    const { transactions, ...pureBlock } = block;
    await blocksRepo.upsert(pureBlock, blocksTable.field.height);
    for ( const [index, transaction] of transactions.entries()) {
      const updatedTransaction = {
        ...transaction,
        [transactionsTable.field.blockId]: block.id,
        [transactionsTable.field.indexInBlock]: index,
      };
      await transactionsRepo.upsert(updatedTransaction);
    }
  }

  async getMaxBlockHeight() {
    return await blocksRepo.count();
  }

  async hasTransaction(transactionId) {
    return await transactionsRepo.id(transactionId).exists();
  }

  async getTransaction(transactionId) {
    const transaction = firstOrNull(await transactionsRepo.id(transactionId).get());
    if (!transaction) {
      let error = new Error(`Transaction ${transactionId} did not exist`);
      error.name = 'TransactionDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    return {...transaction};
  }

  async getTransactionsByTimestamp(offset, limit, order) {
    return transactionsRepo.buildBaseQuery()
      .orderBy(transactionsTable.field.timestamp, order)
      .offset(offset)
      .limit(limit);
  }

  async getTransactionsFromBlock(blockId, offset, limit) {
    if (offset == null) {
      offset = 0;
    }
    const baseQuery = transactionsRepo.buildBaseQuery()
      .where(transactionsTable.field.blockId, blockId)
      .andWhere(transactionsTable.field.indexInBlock, '>=', offset);

    if (limit == null) {
      return baseQuery;
    }
    return baseQuery.limit(limit);
  }

  async getInboundTransactions(walletAddress, fromTimestamp, limit, order) {
    const transactionsQuery = transactionsRepo.buildBaseQuery()
      .orderBy(transactionsTable.field.timestamp, order)
      .where(transactionsTable.field.recipientAddress, walletAddress)
      .limit(limit);
    if (fromTimestamp != null ) {
      if (order === 'desc') {
        transactionsQuery.andWhere(transactionsTable.field.timestamp, '<=', fromTimestamp);
      } else {
        transactionsQuery.andWhere(transactionsTable.field.timestamp, '>=', fromTimestamp);
      }
    }
    return transactionsQuery;
  }

  async getOutboundTransactions(walletAddress, fromTimestamp, limit, order) {
    const transactionsQuery = transactionsRepo.buildBaseQuery()
      .orderBy(transactionsTable.field.timestamp, order)
      .where(transactionsTable.field.senderAddress, walletAddress)
      .limit(limit);
    if (fromTimestamp != null) {
      if (order === 'desc') {
        transactionsQuery.andWhere(transactionsTable.field.timestamp, '<=', fromTimestamp);
      } else {
        transactionsQuery.andWhere(transactionsTable.field.timestamp, '>=', fromTimestamp);
      }
    }
    return transactionsQuery;
  }

  async getInboundTransactionsFromBlock(walletAddress, blockId) {
    const recipientWalletAddressMatcher = {
      [transactionsTable.field.recipientAddress]: walletAddress,
      [transactionsTable.field.blockId]: blockId,
    };
    return await transactionsRepo.get(recipientWalletAddressMatcher);
  }

  async getOutboundTransactionsFromBlock(walletAddress, blockId) {
    const senderWalletAddressMatcher = {
      [transactionsTable.field.senderAddress]: walletAddress,
      [transactionsTable.field.blockId]: blockId,
    };
    return await transactionsRepo.get(senderWalletAddressMatcher);
  }

  async upsertDelegate(delegate) {
    const voteWeight = delegatesTable.field.voteWeight;
    delegate = {...delegate, [voteWeight]: parseInt(delegate[voteWeight], 10)};
    await delegatesRepo.upsert(delegate);
  }

  async hasDelegate(walletAddress) {
    return await delegatesRepo.address(walletAddress).exists();
  }

  async getDelegate(walletAddress) {
    const delegate = firstOrNull(await delegatesRepo.address(walletAddress).get());
    if (!delegate) {
      let error = new Error(`Delegate ${walletAddress} did not exist`);
      error.name = 'DelegateDidNotExistError';
      error.type = 'InvalidActionError';
      throw error;
    }
    const voteWeight = delegatesTable.field.voteWeight;
    return {...delegate, [voteWeight] : delegate[voteWeight].toString()};
  }

  async getDelegatesByVoteWeight(offset, limit, order) {
    const delegates = await delegatesRepo.buildBaseQuery()
      .whereNot(delegatesTable.field.voteWeight, '0')
      .orderBy(delegatesTable.field.voteWeight, order)
      .offset(offset)
      .limit(limit);
    const voteWeight = delegatesTable.field.voteWeight;
    return delegates.map(delegate => ({...delegate, [voteWeight] : delegate[voteWeight].toString()}));
  }

  async simplifyBlock(signedBlock) {
    let {forgerSignature, signatures, ...simpleBlock} = signedBlock;
    return simpleBlock;
  }
}

module.exports = DAL;
