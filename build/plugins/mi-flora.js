"use strict";
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
                    "role": "value",
                    "name": "Fertility",
                    "desc": "Fertility of the soil",
                    "type": "number",
                    "unit": "µS/cm",
                    "read": true,
                    "write": false,
                },
                native: null,
            },
            {
                id: "brightness",
                common: {
                    "role": "value",
                    "name": "Brightness",
                    "type": "number",
                    "unit": "lux",
                    "read": true,
                    "write": false,
                },
                native: null,
            },
            {
                id: "humidity",
                common: {
                    "role": "value",
                    "name": "Humidity",
                    "desc": "Humidity of the soil",
                    "type": "number",
                    "unit": "%",
                    "read": true,
                    "write": false,
                },
                native: null,
            },
            {
                id: "temperature",
                common: {
                    "role": "value",
                    "name": "Temperature",
                    "type": "number",
                    "unit": "°C",
                    "read": true,
                    "write": false,
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
        // do some basic checks
        // Data length must be 15 bytes plus data[14]
        if (data.length < 15)
            return;
        if (data.length !== 15 + data[14])
            return;
        // Data must start with the prefix
        if (!bufferEquals(data.slice(0, 4), PREFIX))
            return;
        // Data must contain the reversed MAC at index 5
        var mac = peripheral.address.replace(/\:/g, "").toLowerCase();
        if (reverseBuffer(data.slice(5, 5 + 6)).toString("hex") !== mac)
            return;
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
        var ret = {};
        ret[stateId] = value;
        return ret;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWktZmxvcmEuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsicGx1Z2lucy9taS1mbG9yYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0E7O0dBRUc7QUFDSCxzQkFBc0IsSUFBdUIsRUFBRSxJQUF1QjtJQUNyRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFBO0lBQzdDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQUNELHVCQUF1QixHQUFXO0lBQ2pDLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDWixDQUFDO0FBRUQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxF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