"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function entries(obj) {
    return Object.keys(obj)
        .map(function (key) { return [key, obj[key]]; });
}
exports.entries = entries;
function values(obj) {
    return Object.keys(obj)
        .map(function (key) { return obj[key]; });
}
exports.values = values;
function filter(obj, predicate) {
    var ret = {};
    for (var _i = 0, _a = entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (predicate(val))
            ret[key] = val;
    }
    return ret;
}
exports.filter = filter;
function composeObject(properties) {
    return properties.reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        acc[key] = value;
        return acc;
    }, {});
}
exports.composeObject = composeObject;
function dig(object, path) {
    function _dig(obj, pathArr) {
        // are we there yet? then return obj
        if (!pathArr.length)
            return obj;
        // go deeper
        var propName = pathArr.shift();
        if (/\[\d+\]/.test(propName)) {
            // this is an array index
            propName = +propName.slice(1, -1);
        }
        return _dig(obj[propName], pathArr);
    }
    return _dig(object, path.split("."));
}
exports.dig = dig;
function bury(object, path, value) {
    function _bury(obj, pathArr) {
        // are we there yet? then return obj
        if (pathArr.length === 1) {
            obj[pathArr[0]] = value;
            return;
        }
        // go deeper
        var propName = pathArr.shift();
        if (/\[\d+\]/.test(propName)) {
            // this is an array index
            propName = +propName.slice(1, -1);
        }
        _bury(obj[propName], pathArr);
    }
    _bury(object, path.split("."));
}
exports.bury = bury;
// Kopiert Eigenschaften rekursiv von einem Objekt auf ein anderes
function extend(target, source) {
    target = target || {};
    for (var _i = 0, _a = entries(source); _i < _a.length; _i++) {
        var _b = _a[_i], prop = _b[0], val = _b[1];
        if (val instanceof Object) {
            target[prop] = extend(target[prop], val);
        }
        else {
            target[prop] = val;
        }
    }
    return target;
}
exports.extend = extend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LXBvbHlmaWxsLmpzIiwic291cmNlUm9vdCI6IkM6L1VzZXJzL0RvbWluaWMvRG9jdW1lbnRzL1Zpc3VhbCBTdHVkaW8gMjAxNy9SZXBvc2l0b3JpZXMvaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9vYmplY3QtcG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFXQSxpQkFBd0IsR0FBUTtJQUMvQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDckIsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFzQixFQUFwQyxDQUFvQyxDQUFDLENBQ2hEO0FBRUYsQ0FBQztBQUxGLDBCQUtFO0FBT0YsZ0JBQXVCLEdBQUc7SUFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1NBQ3JCLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBUixDQUFRLENBQUMsQ0FDcEI7QUFDSCxDQUFDO0FBSkQsd0JBSUM7QUFRRCxnQkFBdUIsR0FBUSxFQUFFLFNBQXlCO0lBQ3pELElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLEdBQUcsQ0FBQyxDQUFxQixVQUFZLEVBQVosS0FBQSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQVosY0FBWSxFQUFaLElBQVk7UUFBMUIsSUFBQSxXQUFVLEVBQVQsV0FBRyxFQUFFLFdBQUc7UUFDbkIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNuQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDWixDQUFDO0FBTkQsd0JBTUM7QUFPRCx1QkFBOEIsVUFBK0I7SUFDNUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENB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