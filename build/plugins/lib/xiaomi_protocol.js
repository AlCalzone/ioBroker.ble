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
var xiaomi_protocol_exports = {};
__export(xiaomi_protocol_exports, {
  CapabilityFlags: () => CapabilityFlags,
  XiaomiAdvertisement: () => XiaomiAdvertisement,
  XiaomiEventIDs_Internal: () => XiaomiEventIDs_Internal
});
module.exports = __toCommonJS(xiaomi_protocol_exports);
var FrameControlFlags = /* @__PURE__ */ ((FrameControlFlags2) => {
  FrameControlFlags2[FrameControlFlags2["NewFactory"] = 1] = "NewFactory";
  FrameControlFlags2[FrameControlFlags2["Connected"] = 2] = "Connected";
  FrameControlFlags2[FrameControlFlags2["Central"] = 4] = "Central";
  FrameControlFlags2[FrameControlFlags2["Encrypted"] = 8] = "Encrypted";
  FrameControlFlags2[FrameControlFlags2["MacAddress"] = 16] = "MacAddress";
  FrameControlFlags2[FrameControlFlags2["Capabilities"] = 32] = "Capabilities";
  FrameControlFlags2[FrameControlFlags2["Event"] = 64] = "Event";
  FrameControlFlags2[FrameControlFlags2["CustomData"] = 128] = "CustomData";
  FrameControlFlags2[FrameControlFlags2["Subtitle"] = 256] = "Subtitle";
  FrameControlFlags2[FrameControlFlags2["Binding"] = 512] = "Binding";
  return FrameControlFlags2;
})(FrameControlFlags || {});
var CapabilityFlags = /* @__PURE__ */ ((CapabilityFlags2) => {
  CapabilityFlags2[CapabilityFlags2["Connectable"] = 1] = "Connectable";
  CapabilityFlags2[CapabilityFlags2["Central"] = 2] = "Central";
  CapabilityFlags2[CapabilityFlags2["Encrypt"] = 4] = "Encrypt";
  CapabilityFlags2[CapabilityFlags2["IO"] = 24] = "IO";
  return CapabilityFlags2;
})(CapabilityFlags || {});
var XiaomiEventIDs_Internal = /* @__PURE__ */ ((XiaomiEventIDs_Internal2) => {
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Temperature"] = 4100] = "Temperature";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["KettleStatusAndTemperature"] = 4101] = "KettleStatusAndTemperature";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Humidity"] = 4102] = "Humidity";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Illuminance"] = 4103] = "Illuminance";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Moisture"] = 4104] = "Moisture";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Fertility"] = 4105] = "Fertility";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["Battery"] = 4106] = "Battery";
  XiaomiEventIDs_Internal2[XiaomiEventIDs_Internal2["TemperatureAndHumidity"] = 4109] = "TemperatureAndHumidity";
  return XiaomiEventIDs_Internal2;
})(XiaomiEventIDs_Internal || {});
const valueTransforms = {
  default: (val, eventID) => {
    if (eventID in XiaomiEventIDs_Internal) {
      return { [XiaomiEventIDs_Internal[eventID].toLowerCase()]: val };
    } else {
      return { [`unknown (0x${eventID.toString(16)})`]: val };
    }
  },
  Temperature: (val) => ({ temperature: toSigned(val, 16) / 10 }),
  Humidity: (val) => ({ humidity: val / 10 }),
  TemperatureAndHumidity: (val) => ({
    humidity: (val >>> 16) / 10,
    temperature: toSigned(val & 65535, 16) / 10
  }),
  KettleStatusAndTemperature: (val) => ({
    kettleStatus: val & 255,
    temperature: val >>> 8
  })
};
class XiaomiAdvertisement {
  constructor(data) {
    if (!data || data.length < 5) {
      throw new Error("A xiaomi advertisement frame must be at least 5 bytes long");
    }
    const frameControl = data.readUInt16LE(0);
    this._version = frameControl >>> 12;
    const flags = frameControl & 4095;
    this._isNewFactory = (flags & 1 /* NewFactory */) !== 0;
    this._isConnected = (flags & 2 /* Connected */) !== 0;
    this._isCentral = (flags & 4 /* Central */) !== 0;
    this._isEncrypted = (flags & 8 /* Encrypted */) !== 0;
    this._hasMacAddress = (flags & 16 /* MacAddress */) !== 0;
    this._hasCapabilities = (flags & 32 /* Capabilities */) !== 0;
    this._hasEvent = (flags & 64 /* Event */) !== 0;
    this._hasCustomData = (flags & 128 /* CustomData */) !== 0;
    this._hasSubtitle = (flags & 256 /* Subtitle */) !== 0;
    this._isBindingFrame = (flags & 512 /* Binding */) !== 0;
    this._productID = data.readUInt16LE(2);
    this._frameCounter = data[4];
    if (this._isEncrypted) {
      throw new Error("Encrypted advertisements are not supported");
    }
    let offset = 5;
    if (this._hasMacAddress) {
      this._macAddress = reverseBuffer(data.slice(offset, offset + 6)).toString("hex");
      offset += 6;
    }
    if (this._hasCapabilities) {
      this._capabilities = data[offset];
      offset++;
    }
    if (this._hasEvent) {
      const eventID = data.readUInt16LE(offset);
      const dataLength = data[offset + 2];
      const eventData = data.slice(offset + 3, offset + 3 + dataLength);
      const numericData = parseNumberLE(eventData);
      if (XiaomiEventIDs_Internal[eventID] in valueTransforms) {
        this._event = valueTransforms[XiaomiEventIDs_Internal[eventID]](numericData);
      } else {
        this._event = valueTransforms.default(numericData, eventID);
      }
    }
  }
  get productID() {
    return this._productID;
  }
  get version() {
    return this._version;
  }
  get frameCounter() {
    return this._frameCounter;
  }
  get isNewFactory() {
    return this._isNewFactory;
  }
  get isConnected() {
    return this._isConnected;
  }
  get isCentral() {
    return this._isCentral;
  }
  get isEncrypted() {
    return this._isEncrypted;
  }
  get hasMacAddress() {
    return this._hasMacAddress;
  }
  get macAddress() {
    return this._macAddress;
  }
  get hasCapabilities() {
    return this._hasCapabilities;
  }
  get capabilities() {
    return this._capabilities;
  }
  get hasEvent() {
    return this._hasEvent;
  }
  get event() {
    return this._event;
  }
  get hasCustomData() {
    return this._hasCustomData;
  }
  get customData() {
    return this._customData;
  }
  get hasSubtitle() {
    return this._hasSubtitle;
  }
  get isBindingFrame() {
    return this._isBindingFrame;
  }
}
function reverseBuffer(buf) {
  const ret = Buffer.allocUnsafe(buf.length);
  for (let i = 0; i < buf.length; i++) {
    ret[i] = buf[buf.length - 1 - i];
  }
  return ret;
}
function parseNumberLE(buf, offset = 0, length = buf.length) {
  let value = 0;
  for (let i = offset + length - 1; i >= offset; i--) {
    value = (value << 8) + buf[i];
  }
  return value;
}
function toSigned(unsigned, size) {
  if (unsigned >>> size - 1 === 1) {
    return unsigned - (1 << size);
  } else {
    return unsigned;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CapabilityFlags,
  XiaomiAdvertisement,
  XiaomiEventIDs_Internal
});
//# sourceMappingURL=xiaomi_protocol.js.map
