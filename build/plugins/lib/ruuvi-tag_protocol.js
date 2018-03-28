"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_polyfill_1 = require("../../lib/object-polyfill");
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
exports.parseDataFormat2or4 = parseDataFormat2or4;
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
exports.parseDataFormat3 = parseDataFormat3;
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
    return object_polyfill_1.stripUndefinedProperties({
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
exports.parseDataFormat5 = parseDataFormat5;
