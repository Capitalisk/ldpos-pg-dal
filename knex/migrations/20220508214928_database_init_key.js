const storeTable = require('../ldpos-table-schema').storeTable;
const blocksTable = require('../ldpos-table-schema').blocksTable;

const DATABASE_INIT_KEY = 'databaseInitialized';
const DATABASE_INIT_VALUE = 'true';

exports.up = async function (knex) {
  let initKeys = await knex(storeTable.name).select().where(storeTable.field.key, DATABASE_INIT_KEY);
  if (!initKeys.length) {
    let blocks = await knex(blocksTable.name).select().where(blocksTable.field.height, '1');
    if (blocks.length) {
      await knex(storeTable.name).insert({
        [storeTable.field.key]: DATABASE_INIT_KEY,
        [storeTable.field.value]: DATABASE_INIT_VALUE
      });
    }
  }
};

exports.down = function (knex) {};
