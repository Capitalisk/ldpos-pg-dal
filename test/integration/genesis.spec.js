const DAL = require('../../src');
const MockMemoryDAL = require('../mocks/dal');
const genesis = require('../fixtures/genesis-functional');
const {
  accountsTable,
  delegatesTable,
  multisigMembershipsTable,
  ballotsTable,
} = require('../../knex/ldpos-table-schema');

const {excludeNullPropertiesFromArr,sort, excludePropertyFromArr, firstOrDefault} = require('../../src/utils');


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
    try {
      await dal.clearAllData();
    } catch (e) {
      console.error(e);
    }
    await dal.destroy();
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
