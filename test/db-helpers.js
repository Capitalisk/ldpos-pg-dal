const {getDataByColumn} = require("../knex/pg-helpers");
const knex = require('../knex/knex');
const {accounts, transactions, blocks, delegates, multisig_memberships, ballots} = require("../knex/ldpos-table-schema");

const accountHelpers = {
    getAccountByAddress : (address) => getDataByColumn(accounts.tableName, accounts.columns.address, address)
}

const transactionHelpers = {
    getTransactionById : (id) => getDataByColumn(transactions.tableName, transactions.columns.id, id)
}

const blockHelpers = {
    getBlockById : (id) => getDataByColumn(blocks.tableName, blocks.columns.id, id)
}

const delegateHelpers = {
    getDelegateByAddress : (address) => getDataByColumn(delegates.tableName, delegates.columns.address, address)
}

const multisig_membership_helpers = {
    getMembershipByMultsigAccountAddress : (address) => getDataByColumn(multisig_memberships.tableName, multisig_memberships.columns.multsigAccountAddress, address),
    getMembershipByMemberAddress: (address) => getDataByColumn(multisig_memberships.tableName, multisig_memberships.columns.memberAddress, address)
}

const ballotsHelpers = {
    getBallotsByTransactionId : (transactionId) => getDataByColumn(ballots.tableName, ballots.columns.id, transactionId),
    getActiveBallots : () => getDataByColumn(ballots.tableName, ballots.columns.active, true)
}

module.exports = { accountHelpers, transactionHelpers, blockHelpers, delegateHelpers, multisig_membership_helpers, ballotsHelpers}
