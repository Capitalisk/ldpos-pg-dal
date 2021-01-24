const dal = require("../../index")
const genesis = require("../fixtures/genesis-functional")
describe('Integration tests', async () => {

    let repository;
    before(async () => {
        repository = await new dal().init({ genesis });
    });

    it('should initialise genesis accounts', async () => {

    });

    it('should initialise genesis blocks', async () => {

    });

    it('should initialise genesis delegates', async () => {

    });

});
