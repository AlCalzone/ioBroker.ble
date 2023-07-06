"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ruuvi_tag_protocol_exports = {};
__export(ruuvi_tag_protocol_exports, {
  parseDataFormat2or4: () => parseDataFormat2or4,
  parseDataFormat3: () => parseDataFormat3,
  parseDataFormat5: () => parseDataFormat5
});
module.exports = __toCommonJS(ruuvi_tag_protocol_exports);
var import_object_polyfill = require("../../lib/object-polyfill");
function parseDataFormat2or4(data) {
  const dataFormat = data[0];
  const humidity = data.readUInt8(1) * 0.5;
  const temperature = data.readInt8(2);
  const pressure = (data.readUInt16BE(4) + 5e4) / 100;
  const ret = {
    dataFormat,
    humidity,
    temperature,
    pressure
  };
  if (dataFormat === 4 && data.length >= 6) {
    ret.beaconID = data[6];
  }
  return ret;
}
function parseDataFormat3(data) {
  const dataFormat = data[0];
  const humidity = data.readUInt8(1) * 0.5;
  const temperature = data.readInt8(2) + data[3] / 100;
  const pressure = (data.readUInt16BE(4) + 5e4) / 100;
  const acceleration = {
    x: data.readInt16BE(6),
    y: data.readInt16BE(8),
    z: data.readInt16BE(10)
  };
  const battery = data.readUInt16BE(12) / 1e3;
  return {
    dataFormat,
    humidity,
    temperature,
    pressure,
    acceleration,
    battery
  };
}
function parseDataFormat5(data) {
  const dataFormat = data[0];
  let temperature = data.readInt16BE(1);
  temperature = temperature !== 32768 ? temperature * 5e-3 : void 0;
  let humidity = data.readUInt16BE(3);
  humidity = humidity !== 65535 ? humidity * 25e-4 : void 0;
  let pressure = data.readUInt16BE(5);
  pressure = pressure !== 65535 ? (pressure + 5e4) / 100 : void 0;
  let acceleration = {
    x: data.readInt16BE(7),
    y: data.readInt16BE(9),
    z: data.readInt16BE(11)
  };
  acceleration.x = acceleration.x !== 32768 ? acceleration.x * 1e-3 : void 0;
  acceleration.y = acceleration.y !== 32768 ? acceleration.y * 1e-3 : void 0;
  acceleration.z = acceleration.z !== 32768 ? acceleration.z * 1e-3 : void 0;
  if (acceleration.x == void 0 && acceleration.y == void 0 && acceleration.z == void 0)
    acceleration = void 0;
  const power = data.readUInt16BE(13);
  let battery;
  let txPower;
  if (power >>> 5 !== 2047)
    battery = (power >>> 5) * 1e-3 + 1.6;
  if ((power & 31) !== 31)
    txPower = (power & 31) * 2 - 40;
  let movementCounter = data[15];
  if (movementCounter === 255)
    movementCounter = void 0;
  let sequenceNumber = data.readUInt16BE(16);
  if (sequenceNumber === 65535)
    sequenceNumber = void 0;
  let macAddress = data.slice(18, 24).toString("hex");
  if (macAddress === "ffffffffffff")
    macAddress = void 0;
  return (0, import_object_polyfill.stripUndefinedProperties)({
    dataFormat,
    temperature,
    humidity,
    pressure,
    acceleration,
    battery,
    txPower,
    movementCounter,
    sequenceNumber,
    macAddress
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseDataFormat2or4,
  parseDataFormat3,
  parseDataFormat5
});
//# sourceMappingURL=ruuvi-tag_protocol.js.map
