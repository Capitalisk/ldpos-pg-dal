const DAL = require('../../src');
const MockMemoryDAL = require('../mocks/dal');
const genesis = require('../fixtures/genesis-functional');
const {
  accountsTable,
  transactionsTable,
  blocksTable,
  delegatesTable,
  multisigMembershipsTable,
  ballotsTable,
  storeTable
} = require('../../knex/ldpos-table-schema');

const {excludeNullPropertiesFromArr,sort, excludePropertyFromArr, firstOrDefault} = require('../../src/utils');

const accountsData = require('../fixtures/accounts');
const transactionsData = require('../fixtures/transactions');
const blocksData = require('../fixtures/blocks');
const delegatesData = require('../fixtures/delegates');
const multisigMembershipsData = require('../fixtures/multisig_memberships');
const ballotsData = require('../fixtures/ballots');
const storeData = require('../fixtures/store');

const fixture = (tableName, data) => ({
  tableName,
  data,
});

const FIXTURES = {
  accounts: fixture(accountsTable.name, accountsData),
  transactions: fixture(transactionsTable.name, transactionsData),
  blocks: fixture(blocksTable.name, blocksData),
  delegates: fixture(delegatesTable.name, delegatesData),
  multisig_memberships: fixture(multisigMembershipsTable.name, multisigMembershipsData),
  ballots: fixture(ballotsTable.name, ballotsData),
  store: fixture(storeTable.name, storeData),
};

describe('Integration tests', async () => {

  let dal;
  let mockDAL;

  before(async () => {
    dal = new DAL();
    await dal.init({
      genesis
    });
    mockDAL = new MockMemoryDAL();
    await mockDAL.init({
      genesis
    });
  });

  after(async () => {
    await Promise.all(
      [...Object.values(FIXTURES)].map(async ({tableName}) => {
        return dal.knexClient.truncate(tableName);
      })
    );
    await dal.knexClient.destroy();
  });

  it('should initialise genesis accounts', async () => {
    const mockAccounts = sort(Object.values(mockDAL.accounts), accountsTable.field.address);
    const actualAccounts = sort(excludeNullPropertiesFromArr(await dal.accountsRepo.get()), accountsTable.field.address);
    expect(actualAccounts).to.deep.equal(mockAccounts);
  });

  it('should initialise genesis delegates', async () => {
    const mockDelegates = sort(Object.values(mockDAL.delegates), delegatesTable.field.address);
    const delegates = excludeNullPropertiesFromArr(await dal.delegatesRepo.get())
    const actualDelegates = sort(delegates, delegatesTable.field.address);
    expect(actualDelegates).to.deep.equal(mockDelegates);
  });

  it('should initialise genesis ballots', async () => {
    const mockBallots = sort(excludePropertyFromArr(Object.values(mockDAL.ballots), ballotsTable.field.id), ballotsTable.field.voterAddress);
    const actualBallots = sort(excludePropertyFromArr(await dal.ballotsRepo.get(), ballotsTable.field.id), ballotsTable.field.voterAddress);
    expect(actualBallots).to.deep.equal(mockBallots);
  });

  it('should initialise genesis multisig_memberships', async () => {
    const mockMemberships = [...firstOrDefault(Object.values(mockDAL.multisigMembers), [])];
    const actualMemberships = (await dal.multisigMembershipsRepo.get()).map(ms => ms[multisigMembershipsTable.field.memberAddress]);
    expect(actualMemberships).to.deep.equal(mockMemberships);
  });

});
