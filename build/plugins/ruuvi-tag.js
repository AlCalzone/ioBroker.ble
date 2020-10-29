"use strict";
/*!
 * Plugin for ruuvi tags with support for the protocol versions 2-5.
 * See https://github.com/ruuvi/ruuvi-sensor-protocols for details
 */
const nodeUrl = require("url");
const global_1 = require("../lib/global");
const ruuvi_tag_protocol_1 = require("./lib/ruuvi-tag_protocol");
const plugin_1 = require("./plugin");
const serviceUUID = "feaa";
const manufacturerId = Buffer.from([0x99, 0x04]);
// remember tested peripherals by their ID for 1h
const testValidity = 1000 * 3600;
const testedPeripherals = new Map();
const plugin = {
    name: "ruuvi-tag",
    description: "Ruuvi Tag",
    advertisedServices: [serviceUUID],
    isHandling: (peripheral) => {
        const cached = testedPeripherals.get(peripheral.id);
        if (cached && cached.timestamp >= Date.now() - testValidity) {
            // we have a recent test result, return it
            return cached.result;
        }
        // we have no quick check, so try to create a context
        let ret = false;
        try {
            const ctx = plugin.createContext(peripheral);
            ret = ctx != null;
        }
        catch (e) {
            /* all good */
        }
        // store the test result
        testedPeripherals.set(peripheral.id, {
            timestamp: Date.now(),
            result: ret,
        });
        return ret;
    },
    createContext: (peripheral) => {
        if (!peripheral.advertisement)
            return;
        let data = plugin_1.getServiceData(peripheral, serviceUUID);
        if (data != undefined) {
            const url = data.toString("utf8");
            global_1.Global.adapter.log.debug(`ruuvi-tag >> got url: ${data.toString("utf8")}`);
            // data format 2 or 4 - extract from URL hash
            const parsedUrl = nodeUrl.parse(url);
            if (!parsedUrl.hash)
                return;
            data = Buffer.from(parsedUrl.hash, "base64");
            return ruuvi_tag_protocol_1.parseDataFormat2or4(data);
        }
        else if (peripheral.advertisement.manufacturerData != null &&
            peripheral.advertisement.manufacturerData.length > 0) {
            // When the data is decoded from manufacturerData, the first two bytes should be 0x9904
            data = peripheral.advertisement.manufacturerData;
            if (data.length <= 2 || !data.slice(0, 2).equals(manufacturerId)) {
                global_1.Global.adapter.log.debug(`ruuvi-tag >> got unsupported data: ${data.toString("hex")}`);
                return;
            }
            // Cut off the manufuacturer ID
            data = data.slice(2);
            // data format 3 or 5 - extract from manufacturerData buffer
            global_1.Global.adapter.log.debug(`ruuvi-tag >> got data: ${data.toString("hex")}`);
            if (data[0] === 3) {
                return ruuvi_tag_protocol_1.parseDataFormat3(data);
            }
            else if (data[0] === 5) {
                return ruuvi_tag_protocol_1.parseDataFormat5(data);
            }
            else {
                global_1.Global.adapter.log.debug(`ruuvi-tag >> unsupported data format ${data[0]}`);
            }
        }
    },
    defineObjects: (context) => {
        if (context == undefined)
            return;
        const deviceObject = {
            // no special definitions neccessary
            common: {
                name: "Ruuvi Tag",
            },
            native: undefined,
        };
        if ("beaconID" in context) {
            deviceObject.native = { beaconID: context.beaconID };
        }
        // no channels
        const stateObjects = [];
        const ret = {
            device: deviceObject,
            channels: undefined,
            states: stateObjects,
        };
        if ("temperature" in context) {
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
        if ("humidity" in context) {
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
        if ("pressure" in context) {
            stateObjects.push({
                id: "pressure",
                common: {
                    role: "value",
                    name: "Air pressure",
                    type: "number",
                    unit: "hPa",
                    read: true,
                    write: false,
                },
                native: undefined,
            });
        }
        if (context.acceleration != undefined) {
            if (context.acceleration.x != null) {
                stateObjects.push({
                    id: "accelerationX",
                    common: {
                        role: "value",
                        name: "Acceleration (X)",
                        type: "number",
                        unit: "G",
                        read: true,
                        write: false,
                    },
                    native: undefined,
                });
            }
            if (context.acceleration.y != null) {
                stateObjects.push({
                    id: "accelerationY",
                    common: {
                        role: "value",
                        name: "Acceleration (Y)",
                        type: "number",
                        unit: "G",
                        read: true,
                        write: false,
                    },
                    native: undefined,
                });
            }
            if (context.acceleration.z != null) {
                stateObjects.push({
                    id: "accelerationZ",
                    common: {
                        role: "value",
                        name: "Acceleration (Z)",
                        type: "number",
                        unit: "G",
                        read: true,
                        write: false,
                    },
                    native: undefined,
                });
            }
        }
        if ("battery" in context) {
            stateObjects.push({
                id: "battery",
                common: {
                    role: "value",
                    name: "Battery",
                    desc: "Battery voltage",
                    type: "number",
                    unit: "mV",
                    read: true,
                    write: false,
                },
                native: undefined,
            });
        }
        if ("txPower" in context) {
            stateObjects.push({
                id: "txPower",
                common: {
                    role: "value",
                    name: "TX Power",
                    desc: "Transmit power",
                    type: "number",
                    unit: "dBm",
                    read: true,
                    write: false,
                },
                native: undefined,
            });
        }
        if ("movementCounter" in context) {
            stateObjects.push({
                id: "movementCounter",
                common: {
                    role: "value",
                    name: "Movement counter",
                    desc: "Incremented through motion detection interrupts",
                    type: "number",
                    read: true,
                    write: false,
                },
                native: undefined,
            });
        }
        return ret;
    },
    getValues: (context) => {
        if (context == null)
            return;
        // strip out unnecessary properties
        const { dataFormat, beaconID, macAddress, sequenceNumber, ...remainder } = context;
        // if acceleration exists, we need to rename the acceleration components
        const { acceleration, ...ret } = remainder;
        if (acceleration != null) {
            const { x, y, z } = acceleration;
            if (x != null)
                ret.accelerationX = x;
            if (y != null)
                ret.accelerationY = y;
            if (z != null)
                ret.accelerationZ = z;
        }
        return ret;
    },
};
module.exports = plugin;
//# sourceMappingURL=ruuvi-tag.js.map