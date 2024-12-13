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
var plugin_exports = {};
__export(plugin_exports, {
  alias: () => alias,
  getServiceData: () => getServiceData
});
module.exports = __toCommonJS(plugin_exports);
function getServiceData(peripheral, uuid) {
  for (const entry of peripheral.advertisement.serviceData) {
    if (entry.uuid === uuid)
      return entry.data;
  }
}
function alias(newName, oldPlugin) {
  const { name, ...plugin } = oldPlugin;
  return {
    name: newName,
    ...plugin
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  alias,
  getServiceData
});
//# sourceMappingURL=plugin.js.map
