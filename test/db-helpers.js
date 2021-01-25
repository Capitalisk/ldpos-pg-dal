const {findMatchingRecords} = require("../knex/pg-helpers");
const knex = require('../knex/knex');
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");

const accountHelpers = {
    getAccountByAddress : (address) => findMatchingRecords(accounts.tableName, { [accounts.columns.address] : address })
}

const transactionHelpers = {
    getTransactionById : (id) => findMatchingRecords(transactions.tableName, { [transactions.columns.id]: id})
}

const blockHelpers = {
    getBlockById : (id) => findMatchingRecords(blocks.tableName, {[blocks.columns.id] : id})
}

const delegateHelpers = {
    getDelegateByAddress : (address) => findMatchingRecords(delegates.tableName, { [delegates.columns.address] : address})
}

const multisig_membership_helpers = {
    getMembershipByMultsigAccountAddress : (address) => findMatchingRecords(multisig_memberships.tableName,{ [multisig_memberships.columns.multsigAccountAddress] : address }),
    getMembershipByMemberAddress: (address) => findMatchingRecords(multisig_memberships.tableName, {[multisig_memberships.columns.memberAddress] : address })
}

const ballotsHelpers = {
    getBallotsByTransactionId : (transactionId) => findMatchingRecords(ballots.tableName, {[ballots.columns.id]: transactionId}),
    getActiveBallots : () => findMatchingRecords(ballots.tableName, {[ballots.columns.active]: true})
}

module.exports = { accountHelpers, transactionHelpers, blockHelpers, delegateHelpers, multisig_membership_helpers, ballotsHelpers}
