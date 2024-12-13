var import_qingping_protocol = require("./lib/qingping_protocol");
var import_global = require("../lib/global");
var import_plugin = require("./plugin");
function parseData(raw) {
  if (raw.length === 1) {
    return raw[0];
  } else {
    return raw.toString("hex");
  }
}
function parseAdvertisementEvent(data) {
  let advertisement;
  try {
    advertisement = new import_qingping_protocol.QingpingAdvertisement(data);
  } catch (e) {
    import_global.Global.adapter.log.debug(`qingping >> failed to parse data`);
    return;
  }
  return advertisement.event;
}
const testValidity = 1e3 * 3600;
const testedPeripherals = /* @__PURE__ */ new Map();
const plugin = {
  name: "Qingping",
  description: "Handles Qingping temperature and humidity sensors",
  advertisedServices: [],
  isHandling: (p) => {
    if (!p.advertisement || !p.advertisement.serviceData || !p.advertisement.serviceData.some((entry) => entry.uuid === "fdcd"))
      return false;
    const mac = p.address.toLowerCase();
    const cached = testedPeripherals.get(mac);
    if (cached && cached.timestamp >= Date.now() - testValidity) {
      return cached.result;
    }
    let ret = false;
    const data = (0, import_plugin.getServiceData)(p, "fdcd");
    if (data != void 0) {
      const event = parseAdvertisementEvent(data);
      ret = event != void 0;
    }
    testedPeripherals.set(mac, {
      timestamp: Date.now(),
      result: ret
    });
    return ret;
  },
  createContext: (peripheral) => {
    const data = (0, import_plugin.getServiceData)(peripheral, "fdcd");
    if (data == void 0)
      return;
    import_global.Global.adapter.log.debug(`qingping >> got data: ${data.toString("hex")}`);
    const event = parseAdvertisementEvent(data);
    if (event == void 0)
      return;
    return { event };
  },
  defineObjects: (context) => {
    if (context == void 0 || context.event == void 0)
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
    const event = context.event;
    if ("temperature" in event) {
      stateObjects.push({
        id: "temperature",
        common: {
          role: "value",
          name: "Temperature",
          type: "number",
          unit: "\xB0C",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("humidity" in event) {
      stateObjects.push({
        id: "humidity",
        common: {
          role: "value",
          name: "Relative Humidity",
          type: "number",
          unit: "%rF",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("battery" in event) {
      stateObjects.push({
        id: "battery",
        common: {
          role: "value",
          name: "Battery",
          desc: "Battery status of the sensor",
          type: "number",
          unit: "%",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    return ret;
  },
  getValues: (context) => {
    if (context == null || context.event == null)
      return;
    return context.event;
  }
};
module.exports = plugin;
//# sourceMappingURL=qingping.js.map
