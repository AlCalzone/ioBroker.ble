"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendState = exports.extendChannel = exports.extendDevice = void 0;
const global_1 = require("./global");
/** Extends a device object in the ioBroker objects DB */
async function extendDevice(deviceId, peripheral, object) {
    const original = (await global_1.Global.objectCache.getObject(`${global_1.Global.adapter.namespace}.${deviceId}`));
    // update the object while preserving the existing properties
    const updated = {
        type: "device",
        common: {
            name: peripheral.advertisement.localName,
            ...object.common,
            ...(original && original.common),
        },
        native: {
            id: peripheral.id,
            address: peripheral.address,
            addressType: peripheral.addressType,
            connectable: peripheral.connectable,
            ...object.native,
            ...(original && original.native),
        },
    };
    // check if we have to update anything
    if (original == null ||
        JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
        JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
        global_1.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} device object ${deviceId}`);
        await global_1.Global.adapter.setObjectAsync(deviceId, updated);
    }
}
exports.extendDevice = extendDevice;
async function extendChannel(channelId, object) {
    const original = (await global_1.Global.objectCache.getObject(`${global_1.Global.adapter.namespace}.${channelId}`));
    // update the object while preserving the existing properties
    const updated = {
        type: "channel",
        common: {
            name: channelId,
            ...object.common,
            ...(original && original.common),
        },
        native: {
            ...object.native,
            ...(original && original.native),
        },
    };
    // check if we have to update anything
    if (original == null ||
        JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
        JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
        global_1.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} channel object ${channelId}`);
        await global_1.Global.adapter.setObjectAsync(channelId, updated);
    }
}
exports.extendChannel = extendChannel;
async function extendState(stateId, object) {
    const original = (await global_1.Global.objectCache.getObject(`${global_1.Global.adapter.namespace}.${stateId}`));
    // update the object while preserving the existing properties
    const updated = {
        type: "state",
        common: {
            role: "state",
            read: true,
            write: false,
            name: stateId,
            ...object.common,
            ...(original && original.common),
        },
        native: {
            ...object.native,
            ...(original && original.native),
        },
    };
    // check if we have to update anything
    if (original == null ||
        JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
        JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
        global_1.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} state object ${stateId}`);
        await global_1.Global.adapter.setObjectAsync(stateId, updated);
    }
}
exports.extendState = extendState;
//# sourceMappingURL=iobroker-objects.js.map