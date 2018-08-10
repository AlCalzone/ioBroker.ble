"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = require("./global");
/** Extends a device object in the ioBroker objects DB */
function extendDevice(deviceId, peripheral, object) {
    return __awaiter(this, void 0, void 0, function () {
        var original, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, global_1.Global.adapter.$getObject(deviceId)];
                case 1:
                    original = _a.sent();
                    updated = {
                        type: "device",
                        common: Object.assign({
                            name: peripheral.advertisement.localName,
                        }, object.common || {}, (original && original.common) || {}),
                        native: Object.assign({
                            id: peripheral.id,
                            address: peripheral.address,
                            addressType: peripheral.addressType,
                            connectable: peripheral.connectable,
                        }, object.native || {}, (original && original.native) || {}),
                    };
                    if (!(original == null
                        || JSON.stringify(original.common) !== JSON.stringify(updated.common)
                        || JSON.stringify(original.native) !== JSON.stringify(updated.native))) return [3 /*break*/, 3];
                    global_1.Global.log((original == null ? "creating" : "updating") + " device object " + deviceId, "debug");
                    return [4 /*yield*/, global_1.Global.adapter.$setObject(deviceId, updated)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.extendDevice = extendDevice;
function extendChannel(channelId, object) {
    return __awaiter(this, void 0, void 0, function () {
        var original, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, global_1.Global.adapter.$getObject(channelId)];
                case 1:
                    original = _a.sent();
                    updated = {
                        type: "channel",
                        common: Object.assign({
                            name: channelId,
                        }, object.common || {}, (original && original.common) || {}),
                        native: Object.assign(object.native || {}, (original && original.native) || {}),
                    };
                    if (!(original == null
                        || JSON.stringify(original.common) !== JSON.stringify(updated.common)
                        || JSON.stringify(original.native) !== JSON.stringify(updated.native))) return [3 /*break*/, 3];
                    global_1.Global.log((original == null ? "creating" : "updating") + " channel object " + channelId, "debug");
                    return [4 /*yield*/, global_1.Global.adapter.$setObject(channelId, updated)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.extendChannel = extendChannel;
function extendState(stateId, object) {
    return __awaiter(this, void 0, void 0, function () {
        var original, updated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, global_1.Global.adapter.$getObject(stateId)];
                case 1:
                    original = _a.sent();
                    updated = {
                        type: "state",
                        common: Object.assign(object.common, (original && original.common) || {}),
                        native: Object.assign(object.native || {}, (original && original.native) || {}),
                    };
                    if (!(original == null
                        || JSON.stringify(original.common) !== JSON.stringify(updated.common)
                        || JSON.stringify(original.native) !== JSON.stringify(updated.native))) return [3 /*break*/, 3];
                    global_1.Global.log((original == null ? "creating" : "updating") + " state object " + stateId, "debug");
                    return [4 /*yield*/, global_1.Global.adapter.$setObject(stateId, updated)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.extendState = extendState;
