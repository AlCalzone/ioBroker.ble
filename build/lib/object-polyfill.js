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
