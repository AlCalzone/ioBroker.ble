var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var nodeUrl = __toESM(require("url"));
var import_global = require("../lib/global");
var import_ruuvi_tag_protocol = require("./lib/ruuvi-tag_protocol");
var import_plugin = require("./plugin");
/*!
 * Plugin for ruuvi tags with support for the protocol versions 2-5.
 * See https://github.com/ruuvi/ruuvi-sensor-protocols for details
 */
const serviceUUID = "feaa";
const manufacturerId = Buffer.from([153, 4]);
const testValidity = 1e3 * 3600;
const testedPeripherals = /* @__PURE__ */ new Map();
const plugin = {
  name: "ruuvi-tag",
  description: "Ruuvi Tag",
  advertisedServices: [serviceUUID],
  isHandling: (peripheral) => {
    const cached = testedPeripherals.get(peripheral.id);
    if (cached && cached.timestamp >= Date.now() - testValidity) {
      return cached.result;
    }
    let ret = false;
    try {
      const ctx = plugin.createContext(peripheral);
      ret = ctx != null;
    } catch (e) {
    }
    testedPeripherals.set(peripheral.id, {
      timestamp: Date.now(),
      result: ret
    });
    return ret;
  },
  createContext: (peripheral) => {
    if (!peripheral.advertisement)
      return;
    let data = (0, import_plugin.getServiceData)(peripheral, serviceUUID);
    if (data != void 0) {
      const url = data.toString("utf8");
      import_global.Global.adapter.log.debug(
        `ruuvi-tag >> got url: ${data.toString("utf8")}`
      );
      const parsedUrl = nodeUrl.parse(url);
      if (!parsedUrl.hash)
        return;
      data = Buffer.from(parsedUrl.hash, "base64");
      return (0, import_ruuvi_tag_protocol.parseDataFormat2or4)(data);
    } else if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0) {
      data = peripheral.advertisement.manufacturerData;
      if (data.length <= 2 || !data.slice(0, 2).equals(manufacturerId)) {
        import_global.Global.adapter.log.debug(
          `ruuvi-tag >> got unsupported data: ${data.toString(
            "hex"
          )}`
        );
        return;
      }
      data = data.slice(2);
      import_global.Global.adapter.log.debug(
        `ruuvi-tag >> got data: ${data.toString("hex")}`
      );
      if (data[0] === 3) {
        return (0, import_ruuvi_tag_protocol.parseDataFormat3)(data);
      } else if (data[0] === 5) {
        return (0, import_ruuvi_tag_protocol.parseDataFormat5)(data);
      } else {
        import_global.Global.adapter.log.debug(
          `ruuvi-tag >> unsupported data format ${data[0]}`
        );
      }
    }
  },
  defineObjects: (context) => {
    if (context == void 0)
      return;
    const deviceObject = {
      common: {
        name: "Ruuvi Tag"
      },
      native: void 0
    };
    if ("beaconID" in context) {
      deviceObject.native = { beaconID: context.beaconID };
    }
    const stateObjects = [];
    const ret = {
      device: deviceObject,
      channels: void 0,
      states: stateObjects
    };
    if ("temperature" in context) {
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
    if ("humidity" in context) {
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
    if ("pressure" in context) {
      stateObjects.push({
        id: "pressure",
        common: {
          role: "value",
          name: "Air pressure",
          type: "number",
          unit: "hPa",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if (context.acceleration != void 0) {
      if (context.acceleration.x != null) {
        stateObjects.push({
          id: "accelerationX",
          common: {
            role: "value",
            name: "Acceleration (X)",
            type: "number",
            unit: "G",
            read: true,
            write: false
          },
          native: void 0
        });
      }
      if (context.acceleration.y != null) {
        stateObjects.push({
          id: "accelerationY",
          common: {
            role: "value",
            name: "Acceleration (Y)",
            type: "number",
            unit: "G",
            read: true,
            write: false
          },
          native: void 0
        });
      }
      if (context.acceleration.z != null) {
        stateObjects.push({
          id: "accelerationZ",
          common: {
            role: "value",
            name: "Acceleration (Z)",
            type: "number",
            unit: "G",
            read: true,
            write: false
          },
          native: void 0
        });
      }
    }
    if ("battery" in context) {
      stateObjects.push({
        id: "battery",
        common: {
          role: "value",
          name: "Battery",
          desc: "Battery voltage",
          type: "number",
          unit: "mV",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("txPower" in context) {
      stateObjects.push({
        id: "txPower",
        common: {
          role: "value",
          name: "TX Power",
          desc: "Transmit power",
          type: "number",
          unit: "dBm",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    if ("movementCounter" in context) {
      stateObjects.push({
        id: "movementCounter",
        common: {
          role: "value",
          name: "Movement counter",
          desc: "Incremented through motion detection interrupts",
          type: "number",
          read: true,
          write: false
        },
        native: void 0
      });
    }
    return ret;
  },
  getValues: (context) => {
    if (context == null)
      return;
    const {
      dataFormat,
      beaconID,
      macAddress,
      sequenceNumber,
      ...remainder
    } = context;
    const { acceleration, ...ret } = remainder;
    if (acceleration != null) {
      const { x, y, z } = acceleration;
      if (x != null)
        ret.accelerationX = x;
      if (y != null)
        ret.accelerationY = y;
      if (z != null)
        ret.accelerationZ = z;
    }
    return ret;
  }
};
module.exports = plugin;
//# sourceMappingURL=ruuvi-tag.js.map
