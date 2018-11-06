"use strict";
/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */
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
        if (data == undefined)
            return;
        global_1.Global.log("xiaomi >> got data: " + data.toString("hex"), "debug");
        var event = parseAdvertisementEvent(data);
        if (event == undefined)
            return;
        return { event: event };
    },
    defineObjects: function (context) {
        if (context == undefined || context.event == undefined)
            return;
        var deviceObject = {
            common: undefined,
            native: undefined,
        };
        // no channels
        var stateObjects = [];
        var ret = {
            device: deviceObject,
            channels: undefined,
            states: stateObjects,
        };
        var event = context.event;
        if (event != undefined) {
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
                    native: undefined,
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
                    native: undefined,
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
                    native: undefined,
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
                    native: undefined,
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
                    native: undefined,
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
                    native: undefined,
                });
            }
        }
        return ret;
    },
    getValues: function (context) {
        if (context == null || context.event == null)
            return;
        for (var _i = 0, _a = objects_1.entries(context.event); _i < _a.length; _i++) {
            var _b = _a[_i], prop = _b[0], value = _b[1];
            global_1.Global.log("xiaomi >> {{green|got " + prop + " update => " + value + "}}", "debug");
        }
        // The event is simply the value dictionary itself
        return context.event;
    },
};
module.exports = plugin;
