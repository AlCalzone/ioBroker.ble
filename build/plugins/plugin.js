"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alias = exports.getServiceData = void 0;
function getServiceData(peripheral, uuid) {
    for (const entry of peripheral.advertisement.serviceData) {
        if (entry.uuid === uuid)
            return entry.data;
    }
}
exports.getServiceData = getServiceData;
/** Aliases an existing plugin with a new name */
function alias(newName, oldPlugin) {
    const { name, ...plugin } = oldPlugin;
    return {
        name: newName,
        ...plugin,
    };
}
exports.alias = alias;
//# sourceMappingURL=plugin.js.map