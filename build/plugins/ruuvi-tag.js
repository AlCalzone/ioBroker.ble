"use strict";
/*!
 * Plugin for ruuvi tags with support for the protocol versions 2-5.
 * See https://github.com/ruuvi/ruuvi-sensor-protocols for details
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var nodeUrl = require("url");
var global_1 = require("../lib/global");
var object_polyfill_1 = require("../lib/object-polyfill");
var plugin_1 = require("./plugin");
var serviceUUID = "feaa";
function stripUndefinedProperties(obj) {
    return object_polyfill_1.composeObject(object_polyfill_1.entries(obj)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return value != null;
    }));
}
function parseDataFormat2or4(data) {
    var dataFormat = data[0];
    var humidity = data.readUInt8(1) * 0.5;
    var temperature = data.readInt8(2);
    var pressure = Math.round((data.readUInt16BE(4) + 50000) / 100); // hPa
    var ret = {
        dataFormat: dataFormat,
        humidity: humidity,
        temperature: temperature,
        pressure: pressure,
    };
    if (dataFormat === 4 && data.length >= 6) {
        ret.beaconID = data[6];
    }
    return ret;
}
function parseDataFormat3(data) {
    var dataFormat = data[0];
    var humidity = data.readUInt8(1) * 0.5;
    var temperature = data.readInt8(2) + data[3] / 100;
    var pressure = Math.round((data.readUInt16BE(4) + 50000) / 100); // hPa
    var acceleration = {
        x: data.readInt16BE(6),
        y: data.readInt16BE(8),
        z: data.readInt16BE(10),
    };
    var battery = data.readUInt16BE(12) / 1000; // mV -> V
    return {
        dataFormat: dataFormat,
        humidity: humidity,
        temperature: temperature,
        pressure: pressure,
        acceleration: acceleration,
        battery: battery,
    };
}
function parseDataFormat5(data) {
    var dataFormat = data[0];
    var temperature = data.readInt16BE(1);
    temperature = temperature !== 0x8000 ? temperature * 0.005 : undefined;
    var humidity = data.readUInt16BE(3);
    humidity = humidity !== 0xffff ? humidity * 0.0025 : undefined;
    var pressure = data.readUInt16BE(5);
    pressure = pressure !== 0xffff ? Math.round((pressure + 50000) / 100) : undefined; // hPa
    var acceleration = {
        x: data.readInt16BE(7),
        y: data.readInt16BE(9),
        z: data.readInt16BE(11),
    };
    acceleration.x = acceleration.x !== 0x8000 ? acceleration.x * 0.001 : undefined;
    acceleration.y = acceleration.y !== 0x8000 ? acceleration.y * 0.001 : undefined;
    acceleration.z = acceleration.z !== 0x8000 ? acceleration.z * 0.001 : undefined;
    if (acceleration.x == undefined && acceleration.y == undefined && acceleration.z == undefined)
        acceleration = undefined;
    var power = data.readUInt16BE(13);
    var battery;
    var txPower;
    if ((power >>> 5) !== 2047)
        battery = (power >>> 5) * 0.001 + 1.6;
    if ((power & 31) !== 31)
        txPower = (power & 31) * 2 - 40;
    var movementCounter = data[15];
    if (movementCounter === 0xff)
        movementCounter = undefined;
    var sequenceNumber = data.readUInt16BE(16);
    if (sequenceNumber === 0xffff)
        sequenceNumber = undefined;
    var macAddress = data.slice(18, 24).toString("hex");
    if (macAddress === "ffffffffffff")
        macAddress = undefined;
    return stripUndefinedProperties({
        dataFormat: dataFormat,
        temperature: temperature,
        humidity: humidity,
        pressure: pressure,
        acceleration: acceleration,
        battery: battery,
        txPower: txPower,
        movementCounter: movementCounter,
        sequenceNumber: sequenceNumber,
        macAddress: macAddress,
    });
}
var plugin = {
    name: "ruuvi-tag",
    description: "Ruuvi Tag",
    advertisedServices: [serviceUUID],
    isHandling: function (peripheral) {
        if (!peripheral.advertisement.localName.startsWith("Ruuvi"))
            return false;
        // variant 1: data in feaa service data
        if (peripheral.advertisement.serviceData.some(function (entry) { return entry.uuid === serviceUUID; }))
            return true;
        // variant 2: data in manufacturerData
        // TODO: do we need to discover it in a different way?
        if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0)
            return true;
    },
    createContext: function (peripheral) {
        var data = plugin_1.getServiceData(peripheral, serviceUUID);
        if (data != null) {
            var url = data.toString("utf8");
            global_1.Global.log("ruuvi-tag >> got url: " + data.toString("utf8"), "debug");
            // data format 2 or 4 - extract from URL hash
            var hash = nodeUrl.parse(url).hash;
            data = Buffer.from(hash, "base64");
            return parseDataFormat2or4(data);
        }
        else if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0) {
            data = peripheral.advertisement.manufacturerData;
            // data format 3 or 5 - extract from manufacturerData buffer
            global_1.Global.log("ruuvi-tag >> got data: " + data.toString("hex"), "debug");
            if (data[0] === 3) {
                return parseDataFormat3(data);
            }
            else if (data[0] === 5) {
                return parseDataFormat5(data);
            }
            else {
                global_1.Global.log("ruuvi-tag >> {{red|unsupported data format " + data[0] + "}}", "debug");
            }
        }
    },
    defineObjects: function (context) {
        if (context == null)
            return;
        var deviceObject = {
            common: null,
            native: null,
        };
        if ("beaconID" in context) {
            deviceObject.native = { beaconID: context.beaconID };
        }
        // no channels
        var stateObjects = [];
        var ret = {
            device: deviceObject,
            channels: null,
            states: stateObjects,
        };
        if (context != null) {
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
                    native: null,
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
                    native: null,
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
                    native: null,
                });
            }
            if ("acceleration" in context) {
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
                        native: null,
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
                        native: null,
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
                        native: null,
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
                    native: null,
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
                    native: null,
                });
            }
            if ("motionCounter" in context) {
                stateObjects.push({
                    id: "motionCounter",
                    common: {
                        role: "value",
                        name: "Motion counter",
                        desc: "Incremented through motion detection interrupts",
                        type: "number",
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
        if (context == null)
            return;
        // strip out unnecessary properties
        var dataFormat = context.dataFormat, beaconID = context.beaconID, macAddress = context.macAddress, sequenceNumber = context.sequenceNumber, remainder = __rest(context, ["dataFormat", "beaconID", "macAddress", "sequenceNumber"]);
        // if acceleration exists, we need to rename the acceleration components
        var acceleration = remainder.acceleration, ret = __rest(remainder, ["acceleration"]);
        if (acceleration != null) {
            var x = acceleration.x, y = acceleration.y, z = acceleration.z;
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
