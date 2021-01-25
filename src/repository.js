const {findMatchingRecords} = require("../knex/knex-helpers");
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");

const accountsRepo = {
    getAccounts: () => findMatchingRecords(accounts.tableName, {}),
    getAccountByAddress : (address) => findMatchingRecords(accounts.tableName, { [accounts.columns.address] : address })
}

const transactionsRepo = {
    getTransactionById : (id) => findMatchingRecords(transactions.tableName, { [transactions.columns.id]: id})
}

const blocksRepo = {
    getBlockById : (id) => findMatchingRecords(blocks.tableName, {[blocks.columns.id] : id})
}

const delegatesRepo = {
    getDelegates: () => findMatchingRecords(delegates.tableName, {}),
    getDelegateByAddress : (address) => findMatchingRecords(delegates.tableName, { [delegates.columns.address] : address})
}

const multisigMembershipsRepo = {
    getMemberShips: () => findMatchingRecords(multisig_memberships.tableName, {}),
    getMembershipByMultsigAccountAddress : (address) => findMatchingRecords(multisig_memberships.tableName,{ [multisig_memberships.columns.multsigAccountAddress] : address }),
    getMembershipByMemberAddress: (address) => findMatchingRecords(multisig_memberships.tableName, {[multisig_memberships.columns.memberAddress] : address })
}

const ballotsRepo = {
    getBallots: () => findMatchingRecords(ballots.tableName, {}),
    getBallotsByTransactionId : (transactionId) => findMatchingRecords(ballots.tableName, {[ballots.columns.id]: transactionId}),
    getActiveBallots : () => findMatchingRecords(ballots.tableName, {[ballots.columns.active]: true})
}

module.exports = { accountsRepo, transactionsRepo, blocksRepo, delegatesRepo, multisigMembershipsRepo, ballotsRepo }
