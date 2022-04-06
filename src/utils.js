let objectType = 'object';
let functionType = 'function';

let firstOrDefault = (array, defaultValue) => (array.length > 0 ? firstValue(array) : defaultValue);

let firstOrNull = (arr) => firstOrDefault(arr, null);

let arrOrDefault = (arr, defaultValue) => isEmptyArray(arr) ? defaultValue : arr;

let arrOrFirstOrNull = (arr) => arr.length > 1 ? arr : firstOrNull(arr);

let firstValue = (array) => array[0];

let isNullOrUndefinedOrEmpty = (obj , checkEmptyString = false) =>
  isNullOrUndefined(obj) || isEmpty(obj) || (checkEmptyString && typeof obj === 'string' && isEmptyString(obj));

let isNullOrUndefined = (obj) => obj == null || obj === undefined;

let isEmptyObjOrFn = (objOrfn) => {
  return typeof objOrfn === objectType && typeof objOrfn !== functionType ? isEmptyObject(objOrfn) : false;
};

let isEmpty = (objOrfnOrArr) => Array.isArray(objOrfnOrArr) ? isEmptyArray(objOrfnOrArr) : isEmptyObjOrFn(objOrfnOrArr);

let isEmptyObject = (obj) => eq(Object.keys(obj).length, 0);

let isEmptyArray = (arr) => arr.length === 0;

let eq = (a, b) => a === b;

let isEmptyString = (stringToCheck, ignoreSpaces = true) => (ignoreSpaces ? stringToCheck.trim() : stringToCheck) === '';

let isLocal = (env) => env === 'development';

let run = (runnable, ...collection) => Promise.all(collection.map(runnable));

let excludeNullPropertiesFromArr = (arr) => {
  return arr.map(
    obj => Object.entries(obj)
      .reduce(
        (object, [key, value]) => (
          isNullOrUndefinedOrEmpty(value) ? object : {...object, [key]: value}
        ),
        {}
      )
  );
}

let excludePropertyFromArr = (arr, propertyName) => {
  return arr.map(
    obj => Object.entries(obj)
      .reduce(
        (object, [key, value]) => (
          key === propertyName ? object : {...object, [key]: value}
        ),
        {}
      )
  );
}

let sort = (arr, key) => arr.sort((o1, o2) => {
  return o1[key].localeCompare(o2[key]);
});

module.exports = {isNullOrUndefinedOrEmpty, firstOrDefault, isLocal, isNullOrUndefined, run, excludeNullPropertiesFromArr, sort, excludePropertyFromArr, arrOrFirstOrNull, isEmpty, firstOrNull,arrOrDefault};
