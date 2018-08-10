"use strict";
/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var objects_1 = require("alcalzone-shared/objects");
var global_1 = require("../lib/global");
var xiaomi_protocol_1 = require("./lib/xiaomi_protocol");
var plugin_1 = require("./plugin");
function parseAdvertisementEvent(data) {
    // try to parse the data
    var advertisement;
    try {
        advertisement = new xiaomi_protocol_1.XiaomiAdvertisement(data);
    }
    catch (e) {
        global_1.Global.log("xiaomi >> failed to parse data", "debug");
        return;
    }
    if (!advertisement.hasEvent || advertisement.isBindingFrame) {
        global_1.Global.log("xiaomi >> The device is not fully initialized.", "debug");
        global_1.Global.log("xiaomi >> Use its app to complete the initialization.", "debug");
        return;
    }
    // succesful - return it
    return advertisement.event;
}
var plugin = {
    name: "Xiaomi",
    description: "Xiaomi devices",
    advertisedServices: ["fe95"],
    isHandling: function (p) {
        var mac = p.address.toLowerCase();
        if (!Object.keys(xiaomi_protocol_1.MacPrefixes).some(function (key) { return mac.startsWith(xiaomi_protocol_1.MacPrefixes[key]); }))
            return false;
        return p.advertisement.serviceData.some(function (entry) { return entry.uuid === "fe95"; });
    },
    createContext: function (peripheral) {
        var data = plugin_1.getServiceData(peripheral, "fe95");
        if (data == null)
            return;
        global_1.Global.log("xiaomi >> got data: " + data.toString("hex"), "debug");
        var event = parseAdvertisementEvent(plugin_1.getServiceData(peripheral, "fe95"));
        if (event == null)
            return;
        return { event: event };
    },
    defineObjects: function (context) {
        if (context == null || context.event == null)
            return;
        var deviceObject = {
            common: null,
            native: null,
        };
        // no channels
        var stateObjects = [];
        var ret = {
            device: deviceObject,
            channels: null,
            states: stateObjects,
        };
        var event = context.event;
        if (event != null) {
            if ("temperature" in event) {
                stateObjects.push({
                    id: "temperature",
                    common: {
                        role: "value",
                        name: "Temperature",
                        type: "number",
                        unit: "°C",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
            if ("humidity" in event) {
                stateObjects.push({
                    id: "humidity",
                    common: {
                        role: "value",
                        name: "Relative Humidity",
                        type: "number",
                        unit: "%rF",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
            if ("illuminance" in event) {
                stateObjects.push({
                    id: "illuminance",
                    common: {
                        role: "value",
                        name: "Illuminance",
                        type: "number",
                        unit: "lux",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
            if ("moisture" in event) {
                stateObjects.push({
                    id: "moisture",
                    common: {
                        role: "value",
                        name: "Moisture",
                        desc: "Moisture of the soil",
                        type: "number",
                        unit: "%",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
            if ("fertility" in event) {
                stateObjects.push({
                    id: "fertility",
                    common: {
                        role: "value",
                        name: "Fertility",
                        desc: "Fertility of the soil",
                        type: "number",
                        unit: "µS/cm",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
            if ("battery" in event) {
                stateObjects.push({
                    id: "battery",
                    common: {
                        role: "value",
                        name: "Battery",
                        desc: "Battery status of the sensor",
                        type: "number",
                        unit: "%",
                        read: true,
                        write: false,
                    },
                    native: null,
                });
            }
        }
        return ret;
    },
    getValues: function (context) {
        var e_1, _a;
        if (context == null || context.event == null)
            return;
        try {
            for (var _b = __values(objects_1.entries(context.event)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), prop = _d[0], value = _d[1];
                global_1.Global.log("xiaomi >> {{green|got " + prop + " update => " + value + "}}", "debug");
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // The event is simply the value dictionary itself
        return context.event;
    },
};
module.exports = plugin;
