"use strict";
/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */
const objects_1 = require("alcalzone-shared/objects");
const global_1 = require("../lib/global");
const xiaomi_protocol_1 = require("./lib/xiaomi_protocol");
const plugin_1 = require("./plugin");
function parseAdvertisementEvent(data) {
    // try to parse the data
    let advertisement;
    try {
        advertisement = new xiaomi_protocol_1.XiaomiAdvertisement(data);
    }
    catch (e) {
        global_1.Global.log(`xiaomi >> failed to parse data`, "debug");
        return;
    }
    if (!advertisement.hasEvent || advertisement.isBindingFrame) {
        global_1.Global.log(`xiaomi >> The device is not fully initialized.`, "debug");
        global_1.Global.log(`xiaomi >> Use its app to complete the initialization.`, "debug");
        return;
    }
    // succesful - return it
    return advertisement.event;
}
const plugin = {
    name: "Xiaomi",
    description: "Xiaomi devices",
    advertisedServices: ["fe95"],
    isHandling: p => {
        if (!p.advertisement || !p.advertisement.serviceData)
            return false;
        const mac = p.address.toLowerCase();
        if (!Object.keys(xiaomi_protocol_1.MacPrefixes).some(key => xiaomi_protocol_1.MacPrefixes[key].some(pfx => mac.startsWith(pfx))))
            return false;
        return p.advertisement.serviceData.some(entry => entry.uuid === "fe95");
    },
    createContext: (peripheral) => {
        const data = plugin_1.getServiceData(peripheral, "fe95");
        if (data == undefined)
            return;
        global_1.Global.log(`xiaomi >> got data: ${data.toString("hex")}`, "debug");
        const event = parseAdvertisementEvent(data);
        if (event == undefined)
            return;
        return { event };
    },
    defineObjects: (context) => {
        if (context == undefined || context.event == undefined)
            return;
        const deviceObject = {
            // no special definitions neccessary
            common: undefined,
            native: undefined
        };
        // no channels
        const stateObjects = [];
        const ret = {
            device: deviceObject,
            channels: undefined,
            states: stateObjects
        };
        const event = context.event;
        if ("temperature" in event) {
            stateObjects.push({
                id: "temperature",
                common: {
                    role: "value",
                    name: "Temperature",
                    type: "number",
                    unit: "°C",
                    read: true,
                    write: false
                },
                native: undefined
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
                    write: false
                },
                native: undefined
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
                    write: false
                },
                native: undefined
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
                    write: false
                },
                native: undefined
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
                    write: false
                },
                native: undefined
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
                    write: false
                },
                native: undefined
            });
        }
        // Create objects for unknown events
        for (const key of Object.keys(event)) {
            if (key.startsWith("unknown ")) {
                stateObjects.push({
                    id: key.replace(/[\(\)]+/g, "").replace(" ", "_"),
                    common: {
                        role: "value",
                        name: key,
                        type: "number",
                        read: true,
                        write: false
                    },
                    native: undefined
                });
            }
        }
        return ret;
    },
    getValues: (context) => {
        if (context == null || context.event == null)
            return;
        for (const [prop, value] of objects_1.entries(context.event)) {
            global_1.Global.log(`xiaomi >> {{green|got ${prop} update => ${value}}}`, "debug");
        }
        // The event is simply the value dictionary itself
        return context.event;
    }
};
module.exports = plugin;
