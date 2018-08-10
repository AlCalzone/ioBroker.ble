"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var objects_1 = require("alcalzone-shared/objects");
// Gräbt in einem Objekt nach dem Property-Pfad.
// Bsps: (obj, "common.asdf.qwer") => obj.common.asdf.qwer
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
// Vergräbt eine Eigenschaft in einem Objekt (Gegenteil von dig)
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
function stripUndefinedProperties(obj) {
    return objects_1.composeObject(objects_1.entries(obj)
        .filter(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return value != null;
    }));
}
exports.stripUndefinedProperties = stripUndefinedProperties;
