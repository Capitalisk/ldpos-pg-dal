const objectType = 'object';
const functionType = 'function';

const firstOrDefault = (array, defaultValue) => (array.length > 0 ? firstValue(array) : defaultValue);

const firstOrNull = (arr) => firstOrDefault(arr, null);

const arrOrFirstOrNull = (arr) => arr.length > 1 ? arr : firstOrNull(arr);

const firstValue = (array) => array[0];

const isNullOrUndefinedOrEmpty = (obj , checkEmptyString = false) =>
    isNullOrUndefined(obj) || isEmpty(obj) || (checkEmptyString && typeof obj === 'string' && isEmptyString(obj));

const isNullOrUndefined = (obj) => obj == null || obj === undefined;

const isEmptyObjOrFn = (objOrfn) => {
    return typeof objOrfn === objectType && typeof objOrfn !== functionType ? isEmptyObject(objOrfn) : false;
};

const isEmpty = (objOrfnOrArr) => Array.isArray(objOrfnOrArr) ? isEmptyArray(objOrfnOrArr) : isEmptyObjOrFn(objOrfnOrArr);

const isEmptyObject = (obj) => eq(Object.keys(obj).length, 0);

const isEmptyArray = (arr) => arr.length === 0;

const eq = (a, b) => a === b;

const isEmptyString = (stringToCheck, ignoreSpaces = true) => (ignoreSpaces ? stringToCheck.trim() : stringToCheck) === '';

const isLocal = (env) => env === "development";

const run = (runnable, ...collection) => Promise.all(collection.map(runnable));

const excludeNullPropertiesFromArr = (arr) => {
    return arr.map(o =>
        Object.entries(o)
            .reduce((object, [key, value]) =>
                    isNullOrUndefinedOrEmpty(value) ? object : {...object, [key]: value}
                , {}));
}

const excludePropertyFromArr = (arr, propertyName) => {
    return arr.map(o =>
        Object.entries(o)
            .reduce((object, [key, value]) =>
                    key === propertyName ? object : {...object, [key]: value}
                , {}));
}

const sort = (arr, key) => arr.sort((o1, o2) => {
    return o1[key].localeCompare(o2[key]);
});

module.exports = { isNullOrUndefinedOrEmpty, firstOrDefault, isLocal, isNullOrUndefined, run, excludeNullPropertiesFromArr, sort, excludePropertyFromArr, arrOrFirstOrNull, isEmpty, firstOrNull}
