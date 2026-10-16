const DAL = require('../../src');
const genesis = require('../fixtures/genesis-functional');
const {accountsTable, storeTable} = require('../../knex/ldpos-table-schema');

// Values and column names which would terminate the surrounding statement and
// start a new one if they were interpolated into the SQL string instead of
// being passed as bindings or escaped as identifiers.
const INJECTED_VALUE = `v'); DROP TABLE "${storeTable.name}"; --`;
const INJECTED_COLUMN = `${storeTable.field.key}") DO NOTHING; DROP TABLE "${storeTable.name}"; --`;

describe('Upsert integration tests', async () => {

  let dal;

  before(async () => {
    dal = new DAL();
    await dal.init({
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

  it('should store values which contain SQL metacharacters verbatim', async () => {
    await dal.saveItem('injectedValue', INJECTED_VALUE);
    expect(await dal.loadItem('injectedValue')).to.equal(INJECTED_VALUE);
  });

  it('should store values which contain SQL metacharacters verbatim when a record already exists', async () => {
    await dal.saveItem('injectedValueOnConflict', 'initial');
    await dal.saveItem('injectedValueOnConflict', INJECTED_VALUE);
    expect(await dal.loadItem('injectedValueOnConflict')).to.equal(INJECTED_VALUE);
  });

  it('should not interpolate object values into the conflict update clause', async () => {
    let objectValue = {nested: INJECTED_VALUE};
    await dal.saveItem('objectValue', objectValue);
    expect(await dal.loadItem('objectValue')).to.equal(JSON.stringify(objectValue));
  });

  it('should not execute statements injected through conflict column names', async () => {
    let countBeforeUpsert = await dal.storeRepo.count();
    let upsertError = null;
    try {
      await dal.storeRepo.upsert(
        {
          [storeTable.field.key]: 'injectedColumn',
          [storeTable.field.value]: 'injectedColumn',
        },
        INJECTED_COLUMN
      );
    } catch (error) {
      upsertError = error;
    }
    expect(upsertError).to.not.equal(null);
    // The store table must have survived the injected DROP TABLE.
    expect(await dal.storeRepo.count()).to.equal(countBeforeUpsert);
  });

  it('should overwrite every supplied column when the record already exists', async () => {
    let {address} = genesis.accounts[0];
    await dal.upsertAccount({
      [accountsTable.field.address]: address,
      [accountsTable.field.type]: 'sig',
      [accountsTable.field.balance]: '1234',
      [accountsTable.field.updateHeight]: 7,
    });
    let account = await dal.getAccount(address);
    expect(account[accountsTable.field.balance]).to.equal('1234');
    expect(account[accountsTable.field.updateHeight]).to.equal(7);
  });

});
