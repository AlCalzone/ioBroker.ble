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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWktZmxvcmEuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsicGx1Z2lucy9taS1mbG9yYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0E7O0dBRUc7QUFDSCxzQkFBc0IsSUFBdUIsRUFBRSxJQUF1QjtJQUNyRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUM7UUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzlDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQUNELHVCQUF1QixHQUFXO0lBQ2pDLElBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDWixDQUFDO0FBRUQsSUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxF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