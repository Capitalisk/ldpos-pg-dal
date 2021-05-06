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

const TABLE_DOES_NOT_EXIST_ERROR_CODE = '42P01';

const KNEX_CLIENTS = {
  POSTGRES_CLIENT: 'pg',
  SQLITE_CLIENT: 'sqlite3'
}

class KnexClient {
  constructor(dalConfig) {
    dalConfig = dalConfig || {};
    this.logger = dalConfig.logger || console;
    this.knexConfig = {
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
    }
    this.knex = knex(this.knexConfig)
    if (isLocal(environment)) {
      this.knex.on('query', (...args) => {
        if (process.env.KNEX_DEBUG) {
          this.logger.info(args);
        }
      });
    }
    this.tableNames = Object.entries(tableSchema).map(([_, value]) => value.name);
  }

  isSqliteClient = () => this.knexConfig.client === KNEX_CLIENTS.SQLITE_CLIENT

  async migrateLatest() {
    return this.knex.migrate.latest();
  }

  async upsert(tableName, data, byColumns, columnsToRetain = []) {
    const update = this.knex.queryBuilder()
      .update(data)
      .toString();

    const insert = this.knex(tableName)
      .insert(data)
      .toString();

    const keepValues = columnsToRetain.map((c) => `"${c}"=${tableName}."${c}"`).join(',');

    const conflictColumns = byColumns.map((c) => `"${c.toString()}"`).join(',');

    let insertOrUpdateQuery = `${insert} ON CONFLICT(${conflictColumns}) DO ${update}`;
    insertOrUpdateQuery = !isNullOrUndefinedOrEmpty(keepValues, true) ? `${insertOrUpdateQuery}, ${keepValues}` : insertOrUpdateQuery;
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`update "${tableName}"`, 'update');
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`"${tableName}"`, tableName);
    return Promise.resolve(this.knex.raw(insertOrUpdateQuery));
  }

  async areAllTablesEmpty() {
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
        .count('*', {as : 'count'})
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

  async truncateAllExistingTables() {
    return await Promise.all(
      this.tableNames.map(async (tableName) => {
        try {
          await this.truncate(tableName);
        } catch (error) {
          // Ignore table does not exist error.
          if (error.code !== TABLE_DOES_NOT_EXIST_ERROR_CODE) {
            throw error;
          }
        }
      })
    );
  }

  async destroy() {
    return this.knex.destroy();
  }
}

module.exports = KnexClient;
