var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
var iobroker_objects_exports = {};
__export(iobroker_objects_exports, {
  extendChannel: () => extendChannel,
  extendDevice: () => extendDevice,
  extendState: () => extendState
});
module.exports = __toCommonJS(iobroker_objects_exports);
var import_global = require("./global");
async function extendDevice(deviceId, peripheral, object) {
  const original = await import_global.Global.objectCache.getObject(`${import_global.Global.adapter.namespace}.${deviceId}`);
  const updated = {
    type: "device",
    common: __spreadValues(__spreadValues({
      name: peripheral.advertisement.localName
    }, object.common), original && original.common),
    native: __spreadValues(__spreadValues({
      id: peripheral.id,
      address: peripheral.address,
      addressType: peripheral.addressType,
      connectable: peripheral.connectable
    }, object.native), original && original.native)
  };
  if (original == null || JSON.stringify(original.common) !== JSON.stringify(updated.common) || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
    import_global.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} device object ${deviceId}`);
    await import_global.Global.adapter.setObjectAsync(deviceId, updated);
  }
}
async function extendChannel(channelId, object) {
  const original = await import_global.Global.objectCache.getObject(`${import_global.Global.adapter.namespace}.${channelId}`);
  const updated = {
    type: "channel",
    common: __spreadValues(__spreadValues({
      name: channelId
    }, object.common), original && original.common),
    native: __spreadValues(__spreadValues({}, object.native), original && original.native)
  };
  if (original == null || JSON.stringify(original.common) !== JSON.stringify(updated.common) || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
    import_global.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} channel object ${channelId}`);
    await import_global.Global.adapter.setObjectAsync(channelId, updated);
  }
}
async function extendState(stateId, object) {
  const original = await import_global.Global.objectCache.getObject(`${import_global.Global.adapter.namespace}.${stateId}`);
  const updated = {
    type: "state",
    common: __spreadValues(__spreadValues({
      role: "state",
      read: true,
      write: false,
      name: stateId
    }, object.common), original && original.common),
    native: __spreadValues(__spreadValues({}, object.native), original && original.native)
  };
  if (original == null || JSON.stringify(original.common) !== JSON.stringify(updated.common) || JSON.stringify(original.native) !== JSON.stringify(updated.native)) {
    import_global.Global.adapter.log.debug(`${original == null ? "creating" : "updating"} state object ${stateId}`);
    await import_global.Global.adapter.setObjectAsync(stateId, updated);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  extendChannel,
  extendDevice,
  extendState
});
//# sourceMappingURL=iobroker-objects.js.map
