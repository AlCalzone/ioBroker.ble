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
function stripUndefinedProperties(obj) {
    return objects_1.composeObject(objects_1.entries(obj)
        .filter(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return value != null;
    }));
}
exports.stripUndefinedProperties = stripUndefinedProperties;
