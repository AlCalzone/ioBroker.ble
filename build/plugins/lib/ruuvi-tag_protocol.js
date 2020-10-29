"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDataFormat5 = exports.parseDataFormat3 = exports.parseDataFormat2or4 = void 0;
const object_polyfill_1 = require("../../lib/object-polyfill");
function parseDataFormat2or4(data) {
    const dataFormat = data[0];
    const humidity = data.readUInt8(1) * 0.5;
    const temperature = data.readInt8(2);
    const pressure = (data.readUInt16BE(4) + 50000) / 100; // hPa
    const ret = {
        dataFormat,
        humidity,
        temperature,
        pressure,
    };
    if (dataFormat === 4 && data.length >= 6) {
        ret.beaconID = data[6];
    }
    return ret;
}
exports.parseDataFormat2or4 = parseDataFormat2or4;
function parseDataFormat3(data) {
    const dataFormat = data[0];
    const humidity = data.readUInt8(1) * 0.5;
    const temperature = data.readInt8(2) + data[3] / 100;
    const pressure = (data.readUInt16BE(4) + 50000) / 100; // hPa
    const acceleration = {
        x: data.readInt16BE(6),
        y: data.readInt16BE(8),
        z: data.readInt16BE(10),
    };
    const battery = data.readUInt16BE(12) / 1000; // mV -> V
    return {
        dataFormat,
        humidity,
        temperature,
        pressure,
        acceleration,
        battery,
    };
}
exports.parseDataFormat3 = parseDataFormat3;
function parseDataFormat5(data) {
    const dataFormat = data[0];
    let temperature = data.readInt16BE(1);
    temperature = temperature !== 0x8000 ? temperature * 0.005 : undefined;
    let humidity = data.readUInt16BE(3);
    humidity = humidity !== 0xffff ? humidity * 0.0025 : undefined;
    let pressure = data.readUInt16BE(5);
    pressure = pressure !== 0xffff ? (pressure + 50000) / 100 : undefined; // hPa
    let acceleration = {
        x: data.readInt16BE(7),
        y: data.readInt16BE(9),
        z: data.readInt16BE(11),
    };
    acceleration.x =
        acceleration.x !== 0x8000 ? acceleration.x * 0.001 : undefined;
    acceleration.y =
        acceleration.y !== 0x8000 ? acceleration.y * 0.001 : undefined;
    acceleration.z =
        acceleration.z !== 0x8000 ? acceleration.z * 0.001 : undefined;
    if (acceleration.x == undefined &&
        acceleration.y == undefined &&
        acceleration.z == undefined)
        acceleration = undefined;
    const power = data.readUInt16BE(13);
    let battery;
    let txPower;
    if (power >>> 5 !== 2047)
        battery = (power >>> 5) * 0.001 + 1.6;
    if ((power & 0b11111) !== 0b11111)
        txPower = (power & 0b11111) * 2 - 40;
    let movementCounter = data[15];
    if (movementCounter === 0xff)
        movementCounter = undefined;
    let sequenceNumber = data.readUInt16BE(16);
    if (sequenceNumber === 0xffff)
        sequenceNumber = undefined;
    let macAddress = data.slice(18, 24).toString("hex");
    if (macAddress === "ffffffffffff")
        macAddress = undefined;
    return object_polyfill_1.stripUndefinedProperties({
        dataFormat,
        temperature,
        humidity,
        pressure,
        acceleration,
        battery,
        txPower,
        movementCounter,
        sequenceNumber,
        macAddress,
    });
}
exports.parseDataFormat5 = parseDataFormat5;
//# sourceMappingURL=ruuvi-tag_protocol.js.map