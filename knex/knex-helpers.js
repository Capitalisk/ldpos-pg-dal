const {firstOrDefault} = require("../src/utils");
const knex = require("./knex");

const insert = (tableName, data) => Promise.resolve(knex(tableName).insert(data));

const buildEqualityMatcherQuery = (tableName, matcher) => {
    const baseQuery = knex(tableName).select();
    return Object.entries(matcher).reduce((query, [key, value]) => query.where(key, value), baseQuery);
}

const findMatchingRecords = (tableName, matcher) => Promise.resolve(buildEqualityMatcherQuery(tableName, matcher));

const updateMatchingRecords = (tableName, matcher, updatedData) =>
    Promise.resolve(
        buildEqualityMatcherQuery(tableName, matcher)
            .update(updatedData))

const findMatchingRecordsCount  = (tableName, matcher) =>
    Promise.resolve(
        buildEqualityMatcherQuery(tableName, matcher)
            .count()
            .then((rows) => firstOrDefault(rows, { count: 0 }).count)
    );

const noMatchFound = (tableName, matcher) => findMatchingRecordsCount(tableName, matcher).then((cnt) => cnt === 0)

const matchFound = (tableName, matcher) => noMatchFound(tableName, matcher).then(noMatchFound => !noMatchFound)

const isTableEmpty = (tableName) => noMatchFound(tableName, {})

module.exports = { isTableEmpty, findMatchingRecordsCount, noMatchFound, matchFound, findMatchingRecords, updateMatchingRecords, insert, buildEqualityMatcherQuery }
