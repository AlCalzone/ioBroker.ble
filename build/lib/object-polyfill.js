"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripUndefinedProperties = void 0;
const objects_1 = require("alcalzone-shared/objects");
function stripUndefinedProperties(obj) {
    return objects_1.composeObject(objects_1.entries(obj).filter(([_key, value]) => value != null));
}
exports.stripUndefinedProperties = stripUndefinedProperties;
//# sourceMappingURL=object-polyfill.js.map