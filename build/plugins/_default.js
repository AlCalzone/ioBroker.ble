"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
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
        var e_1, _a;
        var deviceObject = {
            common: undefined,
            native: undefined,
        };
        var channelId = "services";
        var channelObject = {
            id: channelId,
            common: {
                // common
                name: "Advertised services",
                role: "info",
            },
            native: undefined,
        };
        var stateObjects = [];
        try {
            for (var _b = __values(peripheral.advertisement.serviceData), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entry = _c.value;
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
                    native: undefined,
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            device: deviceObject,
            channels: [channelObject],
            states: stateObjects,
        };
    },
    getValues: function (peripheral) {
        var e_2, _a;
        var ret = {};
        try {
            for (var _b = __values(peripheral.advertisement.serviceData), _c = _b.next(); !_c.done; _c = _b.next()) {
                var entry = _c.value;
                var uuid = entry.uuid;
                var stateId = "services." + uuid;
                // remember the transmitted data
                ret[stateId] = parseData(entry.data);
                global_1.Global.log("_default: " + peripheral.address + " > got data " + ret[stateId] + " for " + uuid, "debug");
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return ret;
    },
};
module.exports = plugin;
