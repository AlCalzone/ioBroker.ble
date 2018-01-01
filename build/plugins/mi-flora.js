"use strict";
var global_1 = require("../lib/global");
/**
 * Checks if two buffers or arrays are equal
 */
function bufferEquals(buf1, buf2) {
    if (buf1.length !== buf2.length)
        return false;
    for (var i = 0; i < buf1.length; i++) {
        if (buf1[i] !== buf2[i])
            return false;
    }
    return true;
}
function reverseBuffer(buf) {
    var ret = Buffer.allocUnsafe(buf.length);
    for (var i = 0; i < buf.length; i++) {
        ret[i] = buf[buf.length - 1 - i];
    }
    return ret;
}
var PREFIX = [0x71, 0x20, 0x98, 0x00];
var plugin = {
    name: "Mi-Flora",
    description: "Xiaomi Mi Pflanzensensor",
    advertisedServices: ["fe95"],
    isHandling: function (p) {
        if (!p.address.toLowerCase().startsWith("c4:7c:8d"))
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
            },
            {
                id: "brightness",
                common: {
                    role: "value",
                    name: "Brightness",
                    type: "number",
                    unit: "lux",
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
                    desc: "Humidity of the soil",
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
        global_1.Global.log("mi-flora >> got data: " + data.toString("hex"), "debug");
        // do some basic checks
        // Data length must be 15 bytes plus data[14]
        if (data.length < 15) {
            global_1.Global.log("mi-flora >> incomplete packet", "debug");
            return;
        }
        // Data must start with the prefix
        if (!bufferEquals(data.slice(0, 4), PREFIX)) {
            global_1.Global.log("mi-flora >> prefix missing", "debug");
            return;
        }
        if (data.length !== 15 + data[14]) {
            global_1.Global.log("mi-flora >> data is too short", "debug");
            return;
        }
        // Data must contain the reversed MAC at index 5
        var mac = peripheral.address.replace(/\:/g, "").toLowerCase();
        if (reverseBuffer(data.slice(5, 5 + 6)).toString("hex") !== mac) {
            global_1.Global.log("mi-flora >> data doesn't contain the mac address", "debug");
            return;
        }
        // parse data
        var type = data[12];
        var length = data[14];
        // read <length> LE bytes at the end
        var value = 0;
        for (var i = 1; i <= length; i++) {
            value = (value << 8) + data[data.length - i];
        }
        var stateId;
        switch (type) {
            case 0x4:
                stateId = "temperature";
                value /= 10;
                break;
            case 0x7:
                stateId = "brightness";
                break;
            case 0x8:
                stateId = "humidity";
                break;
            case 0x9:
                stateId = "fertility";
                break;
        }
        global_1.Global.log("mi-flora >> {{green|got " + stateId + " update => " + value + "}}", "debug");
        var ret = {};
        ret[stateId] = value;
        return ret;
    },
};
module.exports = plugin;
/*
PROTOCOL:
INDEX: 0 1 2 3 4 5 6 7 8 9 101112131415
DATA:  712098004f795d658d7cc40d08100117
       PPPPPPPP  MMMMMMMMMMMM  TT  LL
               SS            ??  ??  xx

P: Prefix
S: Sequence number
M: MAC ADDRESS
T: Type
    08 = Humidity (1B)
    04 = Temperature*10  (2B)
    07 = Lux (3B)
    09 = fertility (µs/cm) (2B)
L: Data length
x: Data

*/
