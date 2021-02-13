const {isLocal} = require('../src/utils');
const environment = process.env.ENVIRONMENT || 'development';
const defaultConfig = require('../knexfile.js');
const knex = require('knex');

const {
  accountsTable,
  transactionsTable,
  blocksTable,
  delegatesTable,
  multisigMembershipsTable,
  ballotsTable,
  storeTable
} = require('../knex/ldpos-table-schema');

const {
  firstOrDefault,
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
  arrOrDefault
} = require('../src/utils');

class KnexClient {
  constructor(dalConfig) {
    dalConfig = dalConfig || {};

    this.knex = knex({
      ...defaultConfig,
      connection: {
        ...defaultConfig.connection,
        ...dalConfig.connection,
      },
      pool: {
        ...defaultConfig.pool,
        ...dalConfig.pool,
      },
      migrations: {
        ...defaultConfig.migrations,
        ...dalConfig.migrations,
      },
      seeds: {
        ...defaultConfig.seeds,
        ...dalConfig.seeds,
      },
    });

    if (isLocal(environment)) {
      this.knex.on('query', (...args) => {
        if (process.env.KNEX_DEBUG) {
          console.info(args);
        }
      });
    }
  }

  async migrateLatest() {
    return this.knex.migrate.latest();
  }

  async upsert(tableName, data, byColumns, columnsToRetain = []) {
    const update = this.knex(tableName)
      .update(data)
      .toString();

    const insert = this.knex(tableName)
      .insert(data)
      .toString();

    const keepValues = columnsToRetain.map((c) => `"${c}"=${tableName}."${c}"`).join(',');

    const conflictColumns = byColumns.map((c) => `"${c.toString()}"`).join(',');

    let insertOrUpdateQuery = `${insert} ON CONFLICT( ${conflictColumns}) DO ${update}`;
    insertOrUpdateQuery = !isNullOrUndefinedOrEmpty(keepValues, true) ? `${insertOrUpdateQuery}, ${keepValues}` : insertOrUpdateQuery;
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`update "${tableName}"`, 'update');
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`"${tableName}"`, tableName);
    return Promise.resolve(this.knex.raw(insertOrUpdateQuery));
  }

  async areTablesEmpty() {
    const findAllTablesQuery = `select c.relname as tablename
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r'
      and n.nspname not in ('information_schema','pg_catalog');`;

    const excludedTables = ['knex_migrations', 'knex_migrations_lock'];

    return Promise.resolve(
      this.knex
        .raw(findAllTablesQuery)
        .then((tables) =>
          tables.rows.map((table) => table.tablename).filter((tableName) => !excludedTables.includes(tableName)),
        )
        .then((tableNames) => Promise.all(tableNames.map(async (tableName) => this.isTableEmpty(tableName))))
        .then((emptyTables) => !emptyTables.includes(false)),
    );
  }

  async insert(tableName, data) {
    return Promise.resolve(this.knex(tableName).insert(data));
  }

  buildEqualityMatcherQuery(tableName, matcher, parser) {
    const baseQuery = this.knex(tableName).select();
    const query =  Object.entries(matcher).reduce((query, [key, value]) => query.where(key, value), baseQuery);
    if (isNullOrUndefined(parser)) {
      return query;
    }
    // Monkey-patching the query then functionality to support custom parsing.
    const thenable = query.then;
    query.then = (fn) => {
      return thenable.call(query, dataSet => {
        try {
          const parsedData = parser(dataSet);
          return fn(parsedData);
        } catch (e) {
          console.error(e);
          return Promise.reject(e);
        }
      });
    };
    return query;
  }

  async findMatchingRecords(tableName, matcher, parser) {
    return Promise.resolve(this.buildEqualityMatcherQuery(tableName, matcher, parser));
  }

  async deleteMatchingRecords(tableName, matcher) {
    return Promise.resolve(this.buildEqualityMatcherQuery(tableName, matcher).delete());
  }

  async updateMatchingRecords(tableName, matcher, updatedData) {
    return Promise.resolve(this.buildEqualityMatcherQuery(tableName, matcher).update(updatedData));
  }

  async findMatchingRecordsCount(tableName, matcher) {
    return Promise.resolve(
      this.buildEqualityMatcherQuery(tableName, matcher)
        .count()
        .then((rows) => firstOrDefault(rows, {count: '0'})).then(({count}) => parseInt(count, 10))
    );
  }

  async noMatchFound(tableName, matcher) {
    return this.findMatchingRecordsCount(tableName, matcher).then((cnt) => cnt === 0);
  };

  async matchFound(tableName, matcher) {
    return this.noMatchFound(tableName, matcher).then(noMatchFound => !noMatchFound);
  };

  async isTableEmpty(tableName) {
    return this.noMatchFound(tableName, {});
  };

  async truncate(tableName) {
    return Promise.resolve(this.knex(tableName).truncate());
  }

  async destroy() {
    return this.knex.destroy();
  }
}

module.exports = KnexClient;
