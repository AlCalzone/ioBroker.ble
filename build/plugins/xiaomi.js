var import_objects = require("alcalzone-shared/objects");
var import_global = require("../lib/global");
var import_xiaomi_protocol = require("./lib/xiaomi_protocol");
var import_plugin = require("./plugin");
/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */
function parseAdvertisementEvent(data) {
  let advertisement;
  try {
    advertisement = new import_xiaomi_protocol.XiaomiAdvertisement(data);
  } catch (e) {
    import_global.Global.adapter.log.debug(`xiaomi >> failed to parse data`);
    return;
  }
  if (!advertisement.hasEvent || advertisement.isBindingFrame) {
    import_global.Global.adapter.log.debug(`xiaomi >> The device is not fully initialized.`);
    import_global.Global.adapter.log.debug(`xiaomi >> Use its app to complete the initialization.`);
    return;
  }
  return advertisement.event;
}
const testValidity = 1e3 * 3600;
const testedPeripherals = /* @__PURE__ */ new Map();
const plugin = {
  name: "Xiaomi",
  description: "Xiaomi devices",
  advertisedServices: ["fe95"],
  isHandling: (p) => {
    if (!p.advertisement || !p.advertisement.serviceData || !p.advertisement.serviceData.some((entry) => entry.uuid === "fe95"))
      return false;
    const mac = p.address.toLowerCase();
    const cached = testedPeripherals.get(mac);
    if (cached && cached.timestamp >= Date.now() - testValidity) {
      return cached.result;
    }
    let ret = false;
    const data = (0, import_plugin.getServiceData)(p, "fe95");
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
    const data = (0, import_plugin.getServiceData)(peripheral, "fe95");
    if (data == void 0)
      return;
    import_global.Global.adapter.log.debug(`xiaomi >> got data: ${data.toString("hex")}`);
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
    if ("illuminance" in event) {
      stateObjects.push({
        id: "illuminance",
        common: {
          role: "value",
          name: "Illuminance",
          type: "number",
          unit: "lux",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("moisture" in event) {
      stateObjects.push({
        id: "moisture",
        common: {
          role: "value",
          name: "Moisture",
          desc: "Moisture of the soil",
          type: "number",
          unit: "%",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("fertility" in event) {
      stateObjects.push({
        id: "fertility",
        common: {
          role: "value",
          name: "Fertility",
          desc: "Fertility of the soil",
          type: "number",
          unit: "\xB5S/cm",
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
    if ("kettleStatus" in event) {
      stateObjects.push({
        id: "kettleStatus",
        common: {
          role: "value",
          name: "Kettle status",
          desc: "What the kettle is currently doing",
          type: "number",
          read: true,
          write: false,
          states: {
            "0": "Idle",
            "1": "Heating",
            "2": "Cooling",
            "3": "Keeping warm"
          }
        },
        native: void 0
      });
    }
    for (const key of Object.keys(event)) {
      if (key.startsWith("unknown ")) {
        stateObjects.push({
          id: key.replace(/[\(\)]+/g, "").replace(" ", "_"),
          common: {
            role: "value",
            name: key,
            type: "number",
            read: true,
            write: false
          },
          native: void 0
        });
      }
    }
    return ret;
  },
  getValues: (context) => {
    if (context == null || context.event == null)
      return;
    for (const [prop, value] of (0, import_objects.entries)(context.event)) {
      import_global.Global.adapter.log.debug(`xiaomi >> got ${prop} update => ${value}`);
    }
    return context.event;
  }
};
module.exports = plugin;
//# sourceMappingURL=xiaomi.js.map
