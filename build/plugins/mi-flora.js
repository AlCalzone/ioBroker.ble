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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWktZmxvcmEuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsicGx1Z2lucy9taS1mbG9yYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0NBQTRDO0FBRzVDOztHQUVHO0FBQ0gsc0JBQXNCLElBQXVCLEVBQUUsSUFBdUI7SUFDckUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUM5QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN0QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN2QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNiLENBQUM7QUFDRCx1QkFBdUIsR0FBVztJQUNqQyxJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNyQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ1osQ0FBQztBQUVELElBQU0sTUFBTSxHQUFHLENBQUMsSUFB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