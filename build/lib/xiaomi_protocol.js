"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
var CapabilityFlags;
(function (CapabilityFlags) {
    CapabilityFlags[CapabilityFlags["Connectable"] = 1] = "Connectable";
    CapabilityFlags[CapabilityFlags["Central"] = 2] = "Central";
    CapabilityFlags[CapabilityFlags["Encrypt"] = 4] = "Encrypt";
    CapabilityFlags[CapabilityFlags["IO"] = 24] = "IO";
})(CapabilityFlags = exports.CapabilityFlags || (exports.CapabilityFlags = {}));
var ProductIDs;
(function (ProductIDs) {
    ProductIDs[ProductIDs["MiFlora"] = 152] = "MiFlora";
    // the rest is unknown
})(ProductIDs = exports.ProductIDs || (exports.ProductIDs = {}));
// tslint:disable-next-line:variable-name
exports.MacPrefixes = Object.freeze({
    MiFlora: "c4:7c:8d",
    MiTemperature: "4c:65:a8",
});
var XiaomiAdvertisement = /** @class */ (function () {
    function XiaomiAdvertisement(data) {
        if (!data || data.length < 5) {
            throw new Error("A xiaomi advertisement frame must be at least 5 bytes long");
        }
        // 4 bit version, 12 bit flags
        var frameControl = data.readUInt16LE(0);
        this._version = frameControl >>> 12;
        var flags = frameControl & 0xfff;
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
        // The actual packet content begins at offset 5
        var offset = 5;
        if (this._hasMacAddress) {
            this._macAddress = reverseBuffer(data.slice(offset, offset + 6)).toString("hex");
            offset += 6;
        }
        if (this._hasCapabilities) {
            this._capabilities = data[offset];
            offset++;
        }
        if (this._hasEvent) {
            var eventID = data.readUInt16LE(offset);
            var eventName = XiaomiEventIDs_Internal[eventID];
            var dataLength = data[offset + 2];
            var eventData = data.slice(offset + 3, offset + 3 + dataLength);
            var numericData = parseNumberLE(eventData);
            // check if there's a specialized value transform
            if (XiaomiEventIDs_Internal[eventID] in valueTransforms) {
                this._event = valueTransforms[XiaomiEventIDs_Internal[eventID]](numericData);
            }
            else {
                this._event = valueTransforms.default(numericData, eventID);
            }
        }
    }
    Object.defineProperty(XiaomiAdvertisement.prototype, "productID", {
        get: function () {
            return this._productID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "version", {
        get: function () {
            return this._version;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "frameCounter", {
        get: function () {
            return this._frameCounter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "isNewFactory", {
        get: function () {
            return this._isNewFactory;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "isConnected", {
        get: function () {
            return this._isConnected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "isCentral", {
        get: function () {
            return this._isCentral;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "isEncrypted", {
        get: function () {
            return this._isEncrypted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "hasMacAddress", {
        get: function () {
            return this._hasMacAddress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "macAddress", {
        get: function () {
            return this._macAddress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "hasCapabilities", {
        get: function () {
            return this._hasCapabilities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "capabilities", {
        get: function () {
            return this._capabilities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "hasEvent", {
        get: function () {
            return this._hasEvent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "event", {
        get: function () {
            return this._event;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "hasCustomData", {
        get: function () {
            return this._hasCustomData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "customData", {
        get: function () {
            return this._customData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "hasSubtitle", {
        get: function () {
            return this._hasSubtitle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XiaomiAdvertisement.prototype, "isBindingFrame", {
        get: function () {
            return this._isBindingFrame;
        },
        enumerable: true,
        configurable: true
    });
    return XiaomiAdvertisement;
}());
exports.XiaomiAdvertisement = XiaomiAdvertisement;
var XiaomiEventIDs_Internal;
(function (XiaomiEventIDs_Internal) {
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Temperature"] = 4100] = "Temperature";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Humidity"] = 4102] = "Humidity";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Illuminance"] = 4103] = "Illuminance";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Moisture"] = 4104] = "Moisture";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Fertility"] = 4105] = "Fertility";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["Battery"] = 4106] = "Battery";
    XiaomiEventIDs_Internal[XiaomiEventIDs_Internal["TemperatureAndHumidity"] = 4109] = "TemperatureAndHumidity";
})(XiaomiEventIDs_Internal = exports.XiaomiEventIDs_Internal || (exports.XiaomiEventIDs_Internal = {}));
// value transforms translate the internal data structure to the external one
// in most cases this is a 1:1 match
var valueTransforms = {
    // by default just pass the value through
    default: function (val, eventID) {
        return (_a = {}, _a[XiaomiEventIDs_Internal[eventID].toLowerCase()] = val, _a);
        var _a;
    },
    Temperature: function (val) { return ({ temperature: val / 10 }); },
    Humidity: function (val) { return ({ humidity: val / 10 }); },
    TemperatureAndHumidity: function (val) { return ({
        temperature: (val >>> 8) / 10,
        humidity: (val & 0xff) / 10,
    }); },
};
function reverseBuffer(buf) {
    var ret = Buffer.allocUnsafe(buf.length);
    for (var i = 0; i < buf.length; i++) {
        ret[i] = buf[buf.length - 1 - i];
    }
    return ret;
}
function parseNumberLE(buf, offset, length) {
    if (offset === void 0) { offset = 0; }
    if (length === void 0) { length = buf.length; }
    // read <length> bytes in LE order
    var value = 0;
    for (var i = offset + length - 1; i >= offset; i--) {
        value = (value << 8) + buf[i];
    }
    return value;
}
