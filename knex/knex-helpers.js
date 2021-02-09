const {firstOrDefault, isNullOrUndefined} = require('../src/utils');
const knex = require('./knex');

const insert = (tableName, data) => Promise.resolve(knex(tableName).insert(data));

const buildEqualityMatcherQuery = (tableName, matcher, parser) => {
  const baseQuery = knex(tableName).select();
  const query =  Object.entries(matcher).reduce((query, [key, value]) => query.where(key, value), baseQuery);
  if (isNullOrUndefined(parser)) {
    return query;
  }
  const thenable = query.__proto__.then;
  query.then = (fn) => {
    query.then = thenable;
    return Promise.resolve(query).then(dataSet => {
      const parsedData = parser(dataSet);
      return fn(parsedData);
    });
  }
  return query;
}

const findMatchingRecords = (tableName, matcher, parser) => Promise.resolve(buildEqualityMatcherQuery(tableName, matcher, parser));

const deleteMatchingRecords = (tableName, matcher) => Promise.resolve(buildEqualityMatcherQuery(tableName, matcher).delete());

const updateMatchingRecords = (tableName, matcher, updatedData) =>
  Promise.resolve(
    buildEqualityMatcherQuery(tableName, matcher)
      .update(updatedData));

const findMatchingRecordsCount  = (tableName, matcher) =>
  Promise.resolve(
    buildEqualityMatcherQuery(tableName, matcher)
      .count()
      .then((rows) => firstOrDefault(rows, { count: '0' })).then(({ count }) => parseInt(count, 10))
  );

const noMatchFound = (tableName, matcher) => findMatchingRecordsCount(tableName, matcher).then((cnt) => cnt === 0);

const matchFound = (tableName, matcher) => noMatchFound(tableName, matcher).then(noMatchFound => !noMatchFound);

const isTableEmpty = (tableName) => noMatchFound(tableName, {});

module.exports = {isTableEmpty, findMatchingRecordsCount, noMatchFound, matchFound, findMatchingRecords, updateMatchingRecords, insert, buildEqualityMatcherQuery};
