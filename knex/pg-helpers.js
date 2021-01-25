const knex = require("./knex");
const { isNullOrUndefinedOrEmpty, firstOrDefault } = require("../utils");

const upsert = (tableName, data, byColumns, columnsToRetain = []) => {

    const update = knex(tableName)
        .update(data)
        .toString();

    const insert = knex(tableName)
        .insert(data)
        .toString();

    const keepValues = columnsToRetain.map((c) => `"${c}"=${tableName}."${c}"`).join(',');

    const conflictColumns = byColumns.map((c) => `"${c.toString()}"`).join(',');

    let insertOrUpdateQuery = `${insert} ON CONFLICT( ${conflictColumns}) DO ${update}`;
    insertOrUpdateQuery = !isNullOrUndefinedOrEmpty(keepValues, true) ? `${insertOrUpdateQuery}, ${keepValues}` : insertOrUpdateQuery;
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`update "${tableName}"`, 'update');
    insertOrUpdateQuery = insertOrUpdateQuery.replace(`"${tableName}"`, tableName);
    return Promise.resolve(knex.raw(insertOrUpdateQuery));
};

const getDataByColumn = (tableName, columnName, columnValue) =>
    Promise.resolve(
        knex()
            .select()
            .from(tableName)
            .where(columnName, columnValue));

const isTableEmpty = (tableName) =>
    Promise.resolve(
        knex
            .table(tableName)
            .count()
            .then((table) => firstOrDefault(table, { count: '0' }).count === '0'),
    );

const areTablesEmpty = () => {
    const findAllTablesQuery = `select c.relname as tablename
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'r'
          and n.nspname not in ('information_schema','pg_catalog');`;

    const excludedTables = ['knex_migrations', 'knex_migrations_lock'];

    return Promise.resolve(
        knex
            .raw(findAllTablesQuery)
            .then((tables) =>
                tables.rows.map((table) => table.tablename).filter((tableName) => !excludedTables.includes(tableName)),
            )
            .then((tableNames) => Promise.all(tableNames.map(isTableEmpty)))
            .then((emptyTables) => !emptyTables.includes(false)),
    );
};

module.exports = { upsert, isTableEmpty, areTablesEmpty, getDataByColumn}
