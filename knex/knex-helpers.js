const {firstOrDefault} = require("../src/utils");
const knex = require("./knex");

const insert = (tableName, data) => Promise.resolve(knex(tableName).insert(data));

const buildEqualityMatcherQuery = (tableName, matcher) => {
    const baseQuery = knex(tableName).select();
    return Object.entries(matcher).reduce((query, [key, value]) => query.where(key, value), baseQuery);
}

const findMatchingRecords = (tableName, matcher) => {
    return Promise.resolve(buildEqualityMatcherQuery(tableName, matcher))
};

const updateMatchingRecords = (tableName, matcher, updatedData) => {
    Promise.resolve(
        buildEqualityMatcherQuery(tableName, matcher)
            .update(updatedData));
}

const findMatchingRecordsCount  = (tableName, matcher) =>
    Promise.resolve(
        buildEqualityMatcherQuery(tableName, matcher)
            .count());

const noMatchFound = (tableName, matcher) => {
    return findMatchingRecordsCount(tableName, matcher)
        .then((table) => firstOrDefault(table, { count: '0' }).count === 0);
}

const matchFound = (tableName, matcher) => {
    return noMatchFound(tableName, matcher)
        .then(noMatchFound => !noMatchFound);
}

const isTableEmpty = (tableName) =>
    Promise.resolve(
        knex
            .table(tableName)
            .count()
            .then((table) => firstOrDefault(table, {count: '0'}).count === 0),
    );

module.exports = { isTableEmpty, findMatchingRecordsCount, noMatchFound, matchFound, findMatchingRecords, updateMatchingRecords, insert, buildEqualityMatcherQuery }
