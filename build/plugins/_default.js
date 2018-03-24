"use strict";
var global_1 = require("../lib/global");
function parseData(raw) {
    if (raw.length === 1) {
        // single byte
        return raw[0];
    }
    else {
        // Output hex value
        return raw.toString("hex");
    }
}
var plugin = {
    name: "_default",
    description: "Handles all peripherals that are not handled by other plugins",
    // Just handle all services we receive already
    advertisedServices: [],
    isHandling: function (p) { return true; },
    // No special context necessary. Return the peripheral, so it gets passed to the other methods.
    createContext: function (peripheral) { return peripheral; },
    defineObjects: function (peripheral) {
        var deviceObject = {
            common: null,
            native: null,
        };
        var channelId = "services";
        var channelObject = {
            id: channelId,
            common: {
                // common
                name: "Advertised services",
                role: "info",
            },
            native: null,
        };
        var stateObjects = [];
        for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            var uuid = entry.uuid;
            var stateId = channelId + "." + uuid;
            stateObjects.push({
                id: stateId,
                common: {
                    role: "value",
                    name: "Advertised service " + uuid,
                    desc: "",
                    type: "mixed",
                    read: true,
                    write: false,
                },
                native: null,
            });
        }
        return {
            device: deviceObject,
            channels: [channelObject],
            states: stateObjects,
        };
    },
    getValues: function (peripheral) {
        var ret = {};
        for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            var uuid = entry.uuid;
            var stateId = "services." + uuid;
            // remember the transmitted data
            ret[stateId] = parseData(entry.data);
            global_1.Global.log("_default: " + peripheral.address + " > got data " + ret[stateId] + " for " + uuid, "debug");
        }
        return ret;
    },
};
module.exports = plugin;
