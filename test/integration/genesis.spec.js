const postgresDal = require("../../src")
const mockMemoryDal = require("../mocks/dal")
const genesis = require("../fixtures/genesis-functional")
const { accounts, delegates, multisig_memberships, ballots} = require("../../knex/ldpos-table-schema");
const {accountsRepo, delegatesRepo, ballotsRepo, multisigMembershipsRepo} = require("../../src/repository")
const {excludeNullPropertiesFromArr,sort, excludePropertyFromArr, firstOrDefault} =require("../../src/utils")
const { tearDownAllFixturesAndDestroyConnection} = require('../setup')
describe('Integration tests', async () => {

    let repository;
    let mockRepository;
    before(async () => {
        repository = await new postgresDal().init({ genesis });
        mockRepository = await new mockMemoryDal().init({ genesis });
    });

    after(async () => {
        await tearDownAllFixturesAndDestroyConnection();
    });

    it('should initialise genesis accounts', async () => {
        const mockAccounts = sort(Object.values(mockRepository.accounts), accounts.columns.address);
        const actualAccounts = sort(excludeNullPropertiesFromArr(await accountsRepo.get()), accounts.columns.address);
        expect(actualAccounts).to.deep.equal(mockAccounts);
    });

    it('should initialise genesis delegates', async () => {
        const mockDelegates = sort(Object.values(mockRepository.delegates), delegates.columns.address);
        const actualDelegates = sort(excludeNullPropertiesFromArr(await delegatesRepo.get()), delegates.columns.address);
        expect(actualDelegates).to.deep.equal(mockDelegates);
    });

    it('should initialise genesis ballots', async () => {
        const mockBallots = sort(excludePropertyFromArr(Object.values(mockRepository.ballots), ballots.columns.id), ballots.columns.voterAddress);
        const actualBallots = sort(excludePropertyFromArr(await ballotsRepo.get(), ballots.columns.id), ballots.columns.voterAddress);
        expect(actualBallots).to.deep.equal(mockBallots);
    });

    it('should initialise genesis multisig_memeberships', async () => {
        const mockMemberships = [...firstOrDefault(Object.values(mockRepository.multisigMembers), [])];
        const actualMemberships = (await multisigMembershipsRepo.get()).map(ms => ms[multisig_memberships.columns.memberAddress]);
        expect(actualMemberships).to.deep.equal(mockMemberships);
    });
});
