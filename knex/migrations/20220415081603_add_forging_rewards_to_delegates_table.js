const {delegatesTable, blocksTable, transactionsTable} = require('../ldpos-table-schema');

const BLOCKS_BATCH_SIZE = 100;

exports.up = async function (knex) {
  await knex.schema.alterTable(delegatesTable.name, (tbl) => {
    tbl.bigInteger(delegatesTable.field.forgingRewards);
  });

  await knex(delegatesTable.name).update(delegatesTable.field.forgingRewards, '0');

  let delegateForgingRewards = {};
  let currentBlockHeight = 0;
  let hasBlocks = true;

  while (hasBlocks) {
    let toHeight = currentBlockHeight + BLOCKS_BATCH_SIZE;
    console.log(
      `Processing blocks from height ${
        currentBlockHeight
      } to ${
        toHeight
      }...`
    );
    let blocks = await knex(blocksTable.name)
      .select()
      .whereBetween(blocksTable.field.height, [currentBlockHeight, toHeight]);

    let sanitizedBlocks = await Promise.all(
      blocks.map(async (block) => {
        let transactions = await knex(transactionsTable.name)
          .select()
          .where(transactionsTable.field.blockId, block.id);
        return {
          ...block,
          fees: transactions.reduce((fees, txn) => fees + BigInt(txn.fee), 0n)
        };
      })
    );

    for (let block of sanitizedBlocks) {
      if (!delegateForgingRewards[block.forgerAddress]) {
        delegateForgingRewards[block.forgerAddress] = 0n;
      }
      delegateForgingRewards[block.forgerAddress] += block.fees;
    }
    hasBlocks = !!blocks.length;
    if (hasBlocks) {
      currentBlockHeight = parseInt(blocks[blocks.length - 1].height) + 1;
    }
  }

  console.log('Updating delegate forging rewards...');

  let delegateRewardEntries = Object.entries(delegateForgingRewards);
  for (let [delegateAddress, forgingRewards] of delegateRewardEntries) {
    await knex(delegatesTable.name)
      .where(delegatesTable.field.address, delegateAddress)
      .update(delegatesTable.field.forgingRewards, forgingRewards.toString());
  }

  console.log('Done updating delegate forging rewards.');
};

exports.down = function (knex) {
  return knex.schema.alterTable(delegatesTable.name, (tbl) => {
    tbl.dropColumn(delegatesTable.field.forgingRewards);
  });
};
