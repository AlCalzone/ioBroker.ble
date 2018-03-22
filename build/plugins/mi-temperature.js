"use strict";
var global_1 = require("../lib/global");
var eventParsers = {
    4106: function (buffer, offset) { return ({ bat: buffer.readUInt8(offset) }); },
    4109: function (buffer, offset) { return ({
        tmp: buffer.readUInt16LE(offset) / 10,
        hum: buffer.readUInt16LE(offset + 2) / 10,
    }); },
    4102: function (buffer, offset) { return ({ hum: buffer.readUInt16LE(offset) / 10 }); },
    4100: function (buffer, offset) { return ({ tmp: buffer.readUInt16LE(offset) / 10 }); },
};
function readServiceData(data) {
    if (data.length < 5)
        return null;
    var offset = 0;
    var frameControl = data.readUInt16LE(0);
    var productId = data.readUInt16LE(2);
    var frameCounter = data.readUInt8(4);
    offset = 5;
    var mac;
    var capability;
    var event;
    if (frameControl & 16 /* MAC_INCLUDE */) {
        if (data.length < offset + 6)
            return null;
        mac = data.toString("hex", offset, offset + 5);
        offset += 6;
    }
    if (frameControl & 32 /* CAPABILITY_INCLUDE */) {
        if (data.length < offset + 1)
            return null;
        capability = data.readUInt8(offset);
        offset++;
    }
    if (frameControl & 64 /* EVENT_INCLUDE */) {
        if (data.length < offset + 3)
            return null;
        event = readEventData(data, offset);
    }
    return {
        productId: productId,
        frameCounter: frameCounter,
        mac: mac,
        capability: capability,
        event: event,
    };
}
function readEventData(buffer, offset) {
    if (offset === void 0) { offset = 0; }
    var eventID = buffer.readUInt16LE(offset);
    var length = buffer.readUInt8(offset + 2);
    var data;
    if (eventParsers[eventID] && buffer.length >= (offset + 3 + length)) {
        data = eventParsers[eventID](buffer, offset + 3);
    }
    return {
        eventID: eventID,
        length: length,
        rawHex: buffer.toString("hex", offset + 3, (offset + 3 + length)),
        data: data,
    };
}
var plugin = {
    name: "Mi-Temperature",
    description: "Xiaomi Mi Temperatursensor",
    advertisedServices: ["fe95"],
    isHandling: function (p) {
        if (!p.address.toLowerCase().startsWith("4c:65:a8"))
            return false;
        for (var _i = 0, _a = p.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.uuid === "fe95")
                return true;
        }
        return false;
    },
    defineObjects: function (peripheral) {
        var deviceObject = {
            common: null,
            native: null,
        };
        // no channels
        var stateObjects = [
            {
                id: "battery",
                common: {
                    role: "value",
                    name: "Battery",
                    type: "number",
                    unit: "%",
                    read: true,
                    write: false,
                },
                native: null,
            },
            {
                id: "humidity",
                common: {
                    role: "value",
                    name: "Humidity",
                    desc: "Humidity",
                    type: "number",
                    unit: "%",
                    read: true,
                    write: false,
                },
                native: null,
            },
            {
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
            },
        ];
        return {
            device: deviceObject,
            channels: null,
            states: stateObjects,
        };
    },
    getValues: function (peripheral) {
        var data;
        for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            var uuid = entry.uuid;
            if (entry.uuid === "fe95") {
                data = entry.data;
                break;
            }
        }
        if (data == null)
            return;
        global_1.Global.log("mi-temperature >> got data: " + data.toString("hex"), "debug");
        var serviceData = readServiceData(data);
        if (!(serviceData && serviceData.event && serviceData.event.data)) {
            global_1.Global.log("mi-temperature >> could not parse data", "debug");
        }
        var eventData = serviceData.event.data;
        var ret = {};
        if (eventData.hasOwnProperty("hum")) {
            ret.humidity = eventData.hum;
        }
        if (eventData.hasOwnProperty("tmp")) {
            ret.temperature = eventData.tmp;
        }
        if (eventData.hasOwnProperty("bat")) {
            ret.battery = eventData.bat;
        }
        return ret;
    },
};
module.exports = plugin;
