"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var objects_1 = require("alcalzone-shared/objects");
function stripUndefinedProperties(obj) {
    return objects_1.composeObject(objects_1.entries(obj)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return value != null;
    }));
}
exports.stripUndefinedProperties = stripUndefinedProperties;
