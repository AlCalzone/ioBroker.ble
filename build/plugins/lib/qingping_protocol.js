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
var qingping_protocol_exports = {};
__export(qingping_protocol_exports, {
  QingpingAdvertisement: () => QingpingAdvertisement,
  QingpingEvent: () => QingpingEvent
});
module.exports = __toCommonJS(qingping_protocol_exports);
class QingpingEvent {
  constructor(temp, hum, batt) {
    this.temperature = temp;
    this.humidity = hum;
    this.battery = batt;
  }
}
const fields = [
  { name: "mac", offset: 2, length: 6, type: "mac" },
  { name: "temperature", offset: 10, length: 2, type: "int16", scale: 0.1 },
  { name: "humidity", offset: 12, length: 2, type: "uint16", scale: 0.1 },
  { name: "battery", offset: 16, length: 1, type: "uint8" }
];
const schema = { fields };
class QingpingAdvertisement {
  constructor(data) {
    this._hasEvent = false;
    if (!data || data.length < 17) {
      throw new Error(
        "A Qingping advertisement frame must be at least 17 bytes long"
      );
    }
    const record = this.decodeMessage(data, schema);
    if (record.mac)
      this._macAddress = record.mac;
    if (record.temperature && record.humidity && record.battery) {
      this._hasEvent = true;
      this._event = new QingpingEvent(
        record.temperature,
        record.humidity,
        record.battery
      );
    }
  }
  get event() {
    return this._event;
  }
  get hasEvent() {
    return this._hasEvent;
  }
  get macAddress() {
    return this._macAddress;
  }
  decodeMessage(buffer, schema2) {
    const result = {};
    schema2.fields.forEach((field) => {
      const { name, offset, length, type, scale } = field;
      let value;
      switch (type) {
        case "uint8":
          value = buffer.readUInt8(offset);
          break;
        case "int16":
          value = buffer.readInt16LE(offset);
          break;
        case "uint16":
          value = buffer.readUInt16LE(offset);
          break;
        case "hex":
          value = buffer.slice(offset, offset + length).toString("hex");
          break;
        case "mac":
          const macBytes = buffer.slice(offset, offset + length).reverse();
          value = Array.from(macBytes).map((byte) => byte.toString(16).padStart(2, "0")).join(":");
          break;
        default:
          throw new Error(`Unsupported field type: ${type}`);
      }
      if (scale) {
        value = Math.round(value * scale * 10) / 10;
      }
      result[name] = value;
    });
    return result;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QingpingAdvertisement,
  QingpingEvent
});
//# sourceMappingURL=qingping_protocol.js.map
