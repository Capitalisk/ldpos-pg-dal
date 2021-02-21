const {isLocal} = require('../src/utils');
const environment = process.env.ENVIRONMENT || 'development';
const defaultConfig = require('../knexfile.js');
const knex = require('knex');

const tableSchema = require('../knex/ldpos-table-schema');

const {
  firstOrDefault,
  isNullOrUndefined,
  isNullOrUndefinedOrEmpty,
} = require('../src/utils');

class KnexClient {
  constructor(dalConfig) {
    dalConfig = dalConfig || {};
    this.logger = dalConfig.logger || console;

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
          this.logger.info(args);
        }
      });
    }
    this.tableNames = Object.entries(tableSchema).map(([_, value]) => value.name);
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
    return Promise.all(this.tableNames.map(tableName => this.isTableEmpty(tableName)))
      .then((emptyTables) => !emptyTables.includes(false));
  }

  async insert(tableName, data) {
    return Promise.resolve(this.knex(tableName).insert(data));
  }

  buildEqualityMatcherQuery(tableName, matcher, parser) {
    const baseQuery = this.knex(tableName).select();
    const query = Object.entries(matcher).reduce((query, [key, value]) => query.where(key, value), baseQuery);
    if (isNullOrUndefined(parser)) {
      return query;
    }
    return query.on('query-response', parser);
  }

  async findMatchingRecords(tableName, matcher, parser) {
    return Promise.resolve(this.buildEqualityMatcherQuery(tableName, matcher, parser));
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

  async truncateAllTables() {
    return await Promise.all(this.tableNames.map(tableName => this.truncate(tableName)));
  }

  async destroy() {
    return this.knex.destroy();
  }
}

module.exports = KnexClient;
