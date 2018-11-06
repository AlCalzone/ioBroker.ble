"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
function getServiceData(peripheral, uuid) {
    for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
        var entry = _a[_i];
        if (entry.uuid === uuid)
            return entry.data;
    }
}
exports.getServiceData = getServiceData;
/** Aliases an existing plugin with a new name */
function alias(newName, oldPlugin) {
    var name = oldPlugin.name, plugin = __rest(oldPlugin, ["name"]);
    return __assign({ name: newName }, plugin);
}
exports.alias = alias;
