"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("./global");
/** Extends a device object in the ioBroker objects DB */
function extendDevice(deviceId, peripheral, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const original = yield global_1.Global.objectCache.getObject(`${global_1.Global.adapter.namespace}.${deviceId}`);
        // update the object while preserving the existing properties
        const updated = {
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
        // check if we have to update anything
        if (original == null
            || JSON.stringify(original.common) !== JSON.stringify(updated.common)
            || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
            global_1.Global.log(`${original == null ? "creating" : "updating"} device object ${deviceId}`, "debug");
            yield global_1.Global.adapter.$setObject(deviceId, updated);
        }
    });
}
exports.extendDevice = extendDevice;
function extendChannel(channelId, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const original = yield global_1.Global.objectCache.getObject(channelId);
        // update the object while preserving the existing properties
        const updated = {
            type: "channel",
            common: Object.assign({
                name: channelId,
            }, object.common || {}, (original && original.common) || {}),
            native: Object.assign(object.native || {}, (original && original.native) || {}),
        };
        // check if we have to update anything
        if (original == null
            || JSON.stringify(original.common) !== JSON.stringify(updated.common)
            || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
            global_1.Global.log(`${original == null ? "creating" : "updating"} channel object ${channelId}`, "debug");
            yield global_1.Global.adapter.$setObject(channelId, updated);
        }
    });
}
exports.extendChannel = extendChannel;
function extendState(stateId, object) {
    return __awaiter(this, void 0, void 0, function* () {
        const original = yield global_1.Global.objectCache.getObject(stateId);
        // update the object while preserving the existing properties
        const updated = {
            type: "state",
            common: Object.assign(object.common, (original && original.common) || {}),
            native: Object.assign(object.native || {}, (original && original.native) || {}),
        };
        // check if we have to update anything
        if (original == null
            || JSON.stringify(original.common) !== JSON.stringify(updated.common)
            || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
            global_1.Global.log(`${original == null ? "creating" : "updating"} state object ${stateId}`, "debug");
            yield global_1.Global.adapter.$setObject(stateId, updated);
        }
    });
}
exports.extendState = extendState;
