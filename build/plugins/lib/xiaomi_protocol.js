"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XiaomiAdvertisement = exports.XiaomiEventIDs_Internal = exports.CapabilityFlags = void 0;
var CapabilityFlags;
(function (CapabilityFlags) {
    CapabilityFlags[CapabilityFlags["Connectable"] = 1] = "Connectable";
    CapabilityFlags[CapabilityFlags["Central"] = 2] = "Central";
    CapabilityFlags[CapabilityFlags["Encrypt"] = 4] = "Encrypt";
    CapabilityFlags[CapabilityFlags["IO"] = 24] = "IO";
})(CapabilityFlags = exports.CapabilityFlags || (exports.CapabilityFlags = {}));
var XiaomiEventIDs_Internal;
(function (XiaomiEventIDs_Internal) {
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Temperature"] = 4100] = "Temperature";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["KettleStatusAndTemperature"] = 4101] = "KettleStatusAndTemperature";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Humidity"] = 4102] = "Humidity";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Illuminance"] = 4103] = "Illuminance";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Moisture"] = 4104] = "Moisture";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Fertility"] = 4105] = "Fertility";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Battery"] = 4106] = "Battery";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["TemperatureAndHumidity"] = 4109] = "TemperatureAndHumidity";
})(XiaomiEventIDs_Internal = exports.XiaomiEventIDs_Internal || (exports.XiaomiEventIDs_Internal = {}));
// value transforms translate the internal data structure to the external one
// in most cases this is a 1:1 match
const valueTransforms = {
    // by default just pass the value through
    default: (val, eventID) => {
        if (eventID in XiaomiEventIDs_Internal) {
            return { [XiaomiEventIDs_Internal[eventID].toLowerCase()]: val };
        }
        else {
            return { [`unknown (0x${eventID.toString(16)})`]: val };
        }
    },
    // TODO: find a nicer way to specify the bit size of temperature - this information exists in the packet!
    Temperature: (val) => ({ temperature: toSigned(val, 16) / 10 }),
    Humidity: (val) => ({ humidity: val / 10 }),
    TemperatureAndHumidity: (val) => ({
        // the data is read in little-endian (reverse) order,
        // so val = 0xHHHHTTTT
        humidity: (val >>> 16) / 10,
        temperature: toSigned(val & 0xffff, 16) / 10,
    }),
    KettleStatusAndTemperature: (val) => ({
        // the data is read in little-endian (reverse) order, so val = 0xTTSS
        kettleStatus: val & 0xff,
        temperature: val >>> 8,
    }),
};
class XiaomiAdvertisement {
    constructor(data) {
        if (!data || data.length < 5) {
            throw new Error("A xiaomi advertisement frame must be at least 5 bytes long");
        }
        // 4 bit version, 12 bit flags
        const frameControl = data.readUInt16LE(0);
        this._version = frameControl >>> 12;
        const flags = frameControl & 0xfff;
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
        // Avoid creating thousands of unknown(0xabcd) states
        if (this._isEncrypted) {
            throw new Error("Encrypted advertisements are not supported");
        }
        // The actual packet content begins at offset 5
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
            // const eventName = XiaomiEventIDs_Internal[
            // 	eventID
            // ] as keyof typeof XiaomiEventIDs_Internal;
            const dataLength = data[offset + 2];
            const eventData = data.slice(offset + 3, offset + 3 + dataLength);
            const numericData = parseNumberLE(eventData);
            // check if there's a specialized value transform
            if (XiaomiEventIDs_Internal[eventID] in valueTransforms) {
                this._event = valueTransforms[XiaomiEventIDs_Internal[eventID]](numericData);
            }
            else {
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
exports.XiaomiAdvertisement = XiaomiAdvertisement;
function reverseBuffer(buf) {
    const ret = Buffer.allocUnsafe(buf.length);
    for (let i = 0; i < buf.length; i++) {
        ret[i] = buf[buf.length - 1 - i];
    }
    return ret;
}
function parseNumberLE(buf, offset = 0, length = buf.length) {
    // read <length> bytes in LE order
    let value = 0;
    for (let i = offset + length - 1; i >= offset; i--) {
        value = (value << 8) + buf[i];
    }
    return value;
}
/** Converts an unsigned number to a signed one (e.g. 0xffff = 65535 -> -1) */
function toSigned(unsigned, size) {
    if (unsigned >>> (size - 1) === 1) {
        // if the first bit is 1, we have a negative number
        return unsigned - (1 << size);
    }
    else {
        return unsigned;
    }
}
//# sourceMappingURL=xiaomi_protocol.js.map