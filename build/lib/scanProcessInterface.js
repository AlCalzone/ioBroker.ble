"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessageReviver = exports.ScanExitCodes = void 0;
const typeguards_1 = require("alcalzone-shared/typeguards");
var ScanExitCodes;
(function (ScanExitCodes) {
    ScanExitCodes[ScanExitCodes["RequireNobleFailed"] = 1] = "RequireNobleFailed";
})(ScanExitCodes = exports.ScanExitCodes || (exports.ScanExitCodes = {}));
function getMessageReviver(callback) {
    const reviveValue = (value) => {
        if (typeguards_1.isArray(value)) {
            return value.map((v) => reviveValue(v));
        }
        else if (typeguards_1.isObject(value)) {
            const v = value;
            if (v.type === "Buffer" && typeguards_1.isArray(v.data)) {
                return Buffer.from(v.data);
            }
            else if (v.type === "Error" &&
                typeof v.name === "string" &&
                typeof v.message === "string") {
                const ret = new Error(v.message);
                ret.name = v.name;
                ret.stack = v.stack;
                return ret;
            }
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return reviveObject(value);
        }
        else {
            return value;
        }
    };
    const reviveObject = (input) => {
        const ret = {};
        for (const [key, value] of Object.entries(input)) {
            ret[key] = reviveValue(value);
        }
        return ret;
    };
    return (input) => {
        callback(reviveObject(input));
    };
}
exports.getMessageReviver = getMessageReviver;
//# sourceMappingURL=scanProcessInterface.js.map