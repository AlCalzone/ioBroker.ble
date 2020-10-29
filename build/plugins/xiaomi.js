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
        global_1.Global.adapter.log.debug(`xiaomi >> failed to parse data`);
        return;
    }
    if (!advertisement.hasEvent || advertisement.isBindingFrame) {
        global_1.Global.adapter.log.debug(`xiaomi >> The device is not fully initialized.`);
        global_1.Global.adapter.log.debug(`xiaomi >> Use its app to complete the initialization.`);
        return;
    }
    // succesful - return it
    return advertisement.event;
}
// remember tested peripherals by their MAC address for 1h
const testValidity = 1000 * 3600;
const testedPeripherals = new Map();
const plugin = {
    name: "Xiaomi",
    description: "Xiaomi devices",
    advertisedServices: ["fe95"],
    isHandling: (p) => {
        // If the peripheral has no serviceData with UUID fe95, this is not for us
        if (!p.advertisement ||
            !p.advertisement.serviceData ||
            !p.advertisement.serviceData.some((entry) => entry.uuid === "fe95"))
            return false;
        const mac = p.address.toLowerCase();
        const cached = testedPeripherals.get(mac);
        if (cached && cached.timestamp >= Date.now() - testValidity) {
            // we have a recent test result, return it
            return cached.result;
        }
        // Try to parse advertisement data as a XiaomiEvent to see if this
        // is for us
        let ret = false;
        const data = plugin_1.getServiceData(p, "fe95");
        if (data != undefined) {
            const event = parseAdvertisementEvent(data);
            ret = event != undefined;
        }
        // store the test result
        testedPeripherals.set(mac, {
            timestamp: Date.now(),
            result: ret,
        });
        return ret;
    },
    createContext: (peripheral) => {
        const data = plugin_1.getServiceData(peripheral, "fe95");
        if (data == undefined)
            return;
        global_1.Global.adapter.log.debug(`xiaomi >> got data: ${data.toString("hex")}`);
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
            native: undefined,
        };
        // no channels
        const stateObjects = [];
        const ret = {
            device: deviceObject,
            channels: undefined,
            states: stateObjects,
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
        if ("kettleStatus" in event) {
            stateObjects.push({
                id: "kettleStatus",
                common: {
                    role: "value",
                    name: "Kettle status",
                    desc: "What the kettle is currently doing",
                    type: "number",
                    read: true,
                    write: false,
                    states: {
                        "0": "Idle",
                        "1": "Heating",
                        "2": "Cooling",
                        "3": "Keeping warm",
                    },
                },
                native: undefined,
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
                        write: false,
                    },
                    native: undefined,
                });
            }
        }
        return ret;
    },
    getValues: (context) => {
        if (context == null || context.event == null)
            return;
        for (const [prop, value] of objects_1.entries(context.event)) {
            global_1.Global.adapter.log.debug(`xiaomi >> got ${prop} update => ${value}`);
        }
        // The event is simply the value dictionary itself
        return context.event;
    },
};
module.exports = plugin;
//# sourceMappingURL=xiaomi.js.map