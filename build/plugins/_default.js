"use strict";
var import_global = require("../lib/global");
function parseData(raw) {
  if (raw.length === 1) {
    return raw[0];
  } else {
    return raw.toString("hex");
  }
}
const plugin = {
  name: "_default",
  description: "Handles all peripherals that are not handled by other plugins",
  advertisedServices: [],
  isHandling: (_p) => true,
  createContext: (peripheral) => peripheral,
  defineObjects: (peripheral) => {
    const deviceObject = {
      common: void 0,
      native: void 0
    };
    const channelId = `services`;
    const channelObject = {
      id: channelId,
      common: {
        name: "Advertised services",
        role: "info"
      },
      native: void 0
    };
    const stateObjects = [];
    if (peripheral.advertisement && peripheral.advertisement.serviceData) {
      for (const entry of peripheral.advertisement.serviceData) {
        const uuid = entry.uuid;
        const stateId = `${channelId}.${uuid}`;
        stateObjects.push({
          id: stateId,
          common: {
            role: "value",
            name: "Advertised service " + uuid,
            desc: "",
            type: "mixed",
            read: true,
            write: false
          },
          native: void 0
        });
      }
    }
    if (peripheral.advertisement && peripheral.advertisement.manufacturerData && peripheral.advertisement.manufacturerData.length > 0) {
      stateObjects.push({
        id: `${channelId}.manufacturerData`,
        common: {
          role: "value",
          name: "Manufacturer Data",
          desc: "",
          type: "mixed",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    return {
      device: deviceObject,
      channels: [channelObject],
      states: stateObjects
    };
  },
  getValues: (peripheral) => {
    const ret = {};
    if (peripheral.advertisement && peripheral.advertisement.serviceData) {
      for (const entry of peripheral.advertisement.serviceData) {
        const uuid = entry.uuid;
        const stateId = `services.${uuid}`;
        ret[stateId] = parseData(entry.data);
        import_global.Global.adapter.log.debug(
          `_default: ${peripheral.address} > got data ${ret[stateId]} for ${uuid}`
        );
      }
    }
    if (peripheral.advertisement && peripheral.advertisement.manufacturerData && peripheral.advertisement.manufacturerData.length > 0) {
      const stateId = `services.manufacturerData`;
      ret[stateId] = parseData(peripheral.advertisement.manufacturerData);
      import_global.Global.adapter.log.debug(
        `_default: ${peripheral.address} > got manufacturer data ${ret[stateId]}`
      );
    }
    return ret;
  }
};
module.exports = plugin;
//# sourceMappingURL=_default.js.map
