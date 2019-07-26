"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("alcalzone-shared/objects");
function stripUndefinedProperties(obj) {
    return objects_1.composeObject(objects_1.entries(obj)
        .filter(([key, value]) => value != null));
}
exports.stripUndefinedProperties = stripUndefinedProperties;
