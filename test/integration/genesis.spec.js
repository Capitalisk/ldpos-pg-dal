const dal = require("../../index")
const genesis = require("../fixtures/genesis-functional")
const { tearDownAllFixturesAndDestroyConnection} = require('../setup')
describe('Integration tests', async () => {

    let repository;
    before(async () => {
        repository = await new dal().init({ genesis });
    });

    after(async () => {
        await tearDownAllFixturesAndDestroyConnection();
    });

    it('should initialise genesis accounts', async () => {

    });

    it('should initialise genesis blocks', async () => {

    });

    it('should initialise genesis delegates', async () => {

    });

});
