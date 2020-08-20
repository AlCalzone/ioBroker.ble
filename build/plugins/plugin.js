"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
    const { name } = oldPlugin, plugin = __rest(oldPlugin, ["name"]);
    return Object.assign({ name: newName }, plugin);
}
exports.alias = alias;
