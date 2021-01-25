const objectType = 'object';
const functionType = 'function';

const firstOrDefault = (array, defaultValue) => (array.length > 0 ? firstValue(array) : defaultValue);
const firstValue = (array) => array[0];

const isNullOrUndefinedOrEmpty = (obj , checkEmptyString = false) =>
    isNullOrUndefined(obj) || isEmpty(obj) || (checkEmptyString && typeof obj === 'string' && isEmptyString(obj));

const isNullOrUndefined = (obj) => obj == null || obj === undefined;

const isEmpty = (objOrfn) =>
    typeof objOrfn === objectType && typeof objOrfn !== functionType ? isEmptyObject(objOrfn) : false;

const isEmptyObject = (obj) => eq(Object.keys(obj).length, 0);

const isEmptyArray = (arr) => arr.length === 0;

const eq = (a, b) => a === b;

const isEmptyString = (stringToCheck, ignoreSpaces = true) => (ignoreSpaces ? stringToCheck.trim() : stringToCheck) === '';

const isLocal = (env) => env === "development";

const run = (runnable, ...collection) => Promise.all(collection.map(runnable));


module.exports = { isNullOrUndefinedOrEmpty, firstOrDefault, isLocal, isNullOrUndefined, run, isEmptyArray}
