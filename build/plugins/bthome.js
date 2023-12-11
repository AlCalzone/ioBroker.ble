"use strict";
var import_global = require("../lib/global");
var import_bthome_protocol = require("./lib/bthome_protocol");
var import_plugin = require("./plugin");
function parseAdvertisement(data) {
  let advertisement;
  try {
    advertisement = new import_bthome_protocol.BTHomeAdvertisement(data);
  } catch (e) {
    import_global.Global.adapter.log.debug(`bthome >> failed to parse data`);
    return;
  }
  return advertisement;
}
const plugin = {
  name: "BTHome",
  description: "BTHome devices",
  advertisedServices: ["fcd2"],
  isHandling: (p) => {
    var _a, _b;
    return (_b = (_a = p.advertisement) == null ? void 0 : _a.serviceData) == null ? void 0 : _b.some(
      (entry) => entry.uuid === "fcd2"
    );
  },
  createContext: (peripheral) => {
    const data = (0, import_plugin.getServiceData)(peripheral, "fcd2");
    if (data == void 0)
      return;
    import_global.Global.adapter.log.debug(`bthome >> got data: ${data.toString("hex")}`);
    const advertisement = parseAdvertisement(data);
    if (!advertisement)
      return;
    return {
      packetId: advertisement.packetId,
      multilevelSensors: advertisement.multilevelSensors,
      binarySensors: advertisement.binarySensors,
      specialSensors: advertisement.specialSensors,
      events: advertisement.events
    };
  },
  defineObjects: (context) => {
    var _a, _b;
    if (context == void 0)
      return;
    const deviceObject = {
      common: void 0,
      native: void 0
    };
    const stateObjects = [];
    const ret = {
      device: deviceObject,
      channels: void 0,
      states: stateObjects
    };
    const duplicates = /* @__PURE__ */ new Map();
    for (const ms of context.multilevelSensors) {
      const id = ms.label.toLowerCase();
      const count = (_a = duplicates.get(id)) != null ? _a : 0;
      duplicates.set(id, count + 1);
      const stateObject = {
        id: id + (count > 1 ? `_${count + 1}` : ""),
        common: {
          name: ms.label + (count > 1 ? ` (${count + 1})` : ""),
          read: true,
          write: false,
          type: "number",
          role: "value",
          unit: ms.unit
        },
        native: void 0
      };
      stateObjects.push(stateObject);
    }
    for (const bs of context.binarySensors) {
      const id = bs.label.toLowerCase();
      const count = (_b = duplicates.get(id)) != null ? _b : 0;
      duplicates.set(id, count + 1);
      const stateObject = {
        id: id + (count > 1 ? `_${count + 1}` : ""),
        common: {
          name: bs.label + (count > 1 ? ` (${count + 1})` : ""),
          read: true,
          write: false,
          type: "boolean",
          role: "indicator",
          states: bs.states
        },
        native: void 0
      };
      stateObjects.push(stateObject);
    }
    return ret;
  },
  getValues: (context) => {
    var _a, _b;
    if (context == void 0)
      return;
    const duplicates = /* @__PURE__ */ new Map();
    const ret = {};
    for (const ms of context.multilevelSensors) {
      const id = ms.label.toLowerCase();
      const count = (_a = duplicates.get(id)) != null ? _a : 0;
      duplicates.set(id, count + 1);
      const stateId = id + (count > 1 ? `_${count + 1}` : "");
      ret[stateId] = ms.value;
    }
    for (const bs of context.binarySensors) {
      const id = bs.label.toLowerCase();
      const count = (_b = duplicates.get(id)) != null ? _b : 0;
      duplicates.set(id, count + 1);
      const stateId = id + (count > 1 ? `_${count + 1}` : "");
      ret[stateId] = bs.value;
    }
    return ret;
  }
};
module.exports = plugin;
//# sourceMappingURL=bthome.js.map
