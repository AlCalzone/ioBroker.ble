"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pick = void 0;
/** Returns a subset of `obj` that contains only the given keys */
function pick(obj, keys) {
    const ret = {};
    for (const key of keys) {
        if (key in obj)
            ret[key] = obj[key];
    }
    return ret;
}
exports.pick = pick;
//# sourceMappingURL=misc.js.map