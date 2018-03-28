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
var ruuvi_tag_protocol_1 = require("./lib/ruuvi-tag_protocol");
var plugin_1 = require("./plugin");
var serviceUUID = "feaa";
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
            return ruuvi_tag_protocol_1.parseDataFormat2or4(data);
        }
        else if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0) {
            data = peripheral.advertisement.manufacturerData;
            // data format 3 or 5 - extract from manufacturerData buffer
            global_1.Global.log("ruuvi-tag >> got data: " + data.toString("hex"), "debug");
            if (data[0] === 3) {
                return ruuvi_tag_protocol_1.parseDataFormat3(data);
            }
            else if (data[0] === 5) {
                return ruuvi_tag_protocol_1.parseDataFormat5(data);
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
