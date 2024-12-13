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
var bthome_protocol_exports = {};
__export(bthome_protocol_exports, {
  BTHomeAdvertisement: () => BTHomeAdvertisement
});
module.exports = __toCommonJS(bthome_protocol_exports);
const multilevelSensorsArray = [
  {
    id: 81,
    label: "acceleration",
    signed: false,
    size: 2,
    factor: 1e-3,
    unit: "m/s\xB2"
  },
  {
    id: 1,
    label: "battery",
    signed: false,
    size: 1,
    unit: "%"
  },
  {
    id: 18,
    label: "co2",
    signed: false,
    size: 2,
    unit: "ppm"
  },
  { id: 9, label: "count", signed: false, size: 1 },
  { id: 61, label: "count", signed: false, size: 2 },
  { id: 62, label: "count", signed: false, size: 4 },
  {
    id: 67,
    label: "current",
    signed: false,
    size: 2,
    factor: 1e-3,
    unit: "A"
  },
  {
    id: 8,
    label: "dewpoint",
    signed: true,
    size: 2,
    factor: 0.01,
    unit: "\xB0C"
  },
  {
    id: 64,
    label: "distance (mm)",
    signed: false,
    size: 2,
    unit: "mm"
  },
  {
    id: 65,
    label: "distance (m)",
    signed: false,
    size: 2,
    factor: 0.1,
    unit: "m"
  },
  {
    id: 66,
    label: "duration",
    signed: false,
    size: 3,
    factor: 1e-3,
    unit: "s"
  },
  {
    id: 77,
    label: "energy",
    signed: false,
    size: 4,
    factor: 1e-3,
    unit: "kWh"
  },
  {
    id: 10,
    label: "energy",
    signed: false,
    size: 3,
    factor: 1e-3,
    unit: "kWh"
  },
  {
    id: 75,
    label: "gas",
    signed: false,
    size: 3,
    factor: 1e-3,
    unit: "m3"
  },
  {
    id: 76,
    label: "gas",
    signed: false,
    size: 4,
    factor: 1e-3,
    unit: "m3"
  },
  {
    id: 82,
    label: "gyroscope",
    signed: false,
    size: 2,
    factor: 1e-3,
    unit: "\xB0/s"
  },
  {
    id: 3,
    label: "humidity",
    signed: false,
    size: 2,
    factor: 0.01,
    unit: "%"
  },
  {
    id: 46,
    label: "humidity",
    signed: false,
    size: 1,
    unit: "%"
  },
  {
    id: 5,
    label: "illuminance",
    signed: false,
    size: 3,
    factor: 0.01,
    unit: "lux"
  },
  {
    id: 6,
    label: "mass (kg)",
    signed: false,
    size: 2,
    factor: 0.01,
    unit: "kg"
  },
  {
    id: 7,
    label: "mass (lb)",
    signed: false,
    size: 2,
    factor: 0.01,
    unit: "lb"
  },
  {
    id: 20,
    label: "moisture",
    signed: false,
    size: 2,
    factor: 0.01,
    unit: "%"
  },
  {
    id: 47,
    label: "moisture",
    signed: false,
    size: 1,
    unit: "%"
  },
  {
    id: 13,
    label: "pm2.5",
    signed: false,
    size: 2,
    unit: "ug/m3"
  },
  {
    id: 14,
    label: "pm10",
    signed: false,
    size: 2,
    unit: "ug/m3"
  },
  {
    id: 11,
    label: "power",
    signed: false,
    size: 3,
    factor: 0.01,
    unit: "W"
  },
  {
    id: 4,
    label: "pressure",
    signed: false,
    size: 3,
    factor: 0.01,
    unit: "hPa"
  },
  {
    id: 63,
    label: "rotation",
    signed: true,
    size: 2,
    factor: 0.1,
    unit: "\xB0"
  },
  {
    id: 68,
    label: "speed",
    signed: false,
    size: 2,
    factor: 0.01,
    unit: "m/s"
  },
  {
    id: 69,
    label: "temperature",
    signed: true,
    size: 2,
    factor: 0.1,
    unit: "\xB0C"
  },
  {
    id: 2,
    label: "temperature",
    signed: true,
    size: 2,
    factor: 0.01,
    unit: "\xB0C"
  },
  {
    id: 19,
    label: "tvoc",
    signed: false,
    size: 2,
    unit: "ug/m3"
  },
  {
    id: 12,
    label: "voltage",
    signed: false,
    size: 2,
    factor: 1e-3,
    unit: "V"
  },
  {
    id: 74,
    label: "voltage",
    signed: false,
    size: 2,
    factor: 0.1,
    unit: "V"
  },
  {
    id: 78,
    label: "volume",
    signed: false,
    size: 4,
    factor: 1e-3,
    unit: "L"
  },
  {
    id: 71,
    label: "volume",
    signed: false,
    size: 2,
    factor: 0.1,
    unit: "L"
  },
  {
    id: 72,
    label: "volume",
    signed: false,
    size: 2,
    unit: "mL"
  },
  {
    id: 73,
    label: "volume Flow Rate",
    signed: false,
    size: 2,
    factor: 1e-3,
    unit: "m3/hr"
  },
  {
    id: 70,
    label: "UV index",
    signed: false,
    size: 1,
    factor: 0.1
  },
  {
    id: 79,
    label: "water",
    signed: false,
    size: 4,
    factor: 1e-3,
    unit: "L"
  }
];
const multilevelSensorDefinitions = new Map(multilevelSensorsArray.map((def) => [def.id, def]));
const binarySensorsArray = [
  { id: 21, label: "battery", states: { false: "Normal", true: "Low" } },
  {
    id: 22,
    label: "battery charging",
    states: { false: "Not Charging", true: "Charging" }
  },
  {
    id: 23,
    label: "carbon monoxide",
    states: { false: "Not detected", true: "Detected" }
  },
  { id: 24, label: "cold", states: { false: "Normal", true: "Cold" } },
  {
    id: 25,
    label: "connectivity",
    states: { false: "Disconnected", true: "Connected" }
  },
  { id: 26, label: "door", states: { false: "Closed", true: "Open" } },
  {
    id: 27,
    label: "garage door",
    states: { false: "Closed", true: "Open" }
  },
  { id: 28, label: "gas", states: { false: "Clear", true: "Detected" } },
  {
    id: 15,
    label: "generic boolean",
    states: { false: "Off", true: "On" }
  },
  { id: 29, label: "heat", states: { false: "Normal", true: "Hot" } },
  {
    id: 30,
    label: "light",
    states: { false: "No light", true: "Light detected" }
  },
  { id: 31, label: "lock", states: { false: "Locked", true: "Unlocked" } },
  { id: 32, label: "moisture", states: { false: "Dry", true: "Wet" } },
  { id: 33, label: "motion", states: { false: "Clear", true: "Detected" } },
  {
    id: 34,
    label: "moving",
    states: { false: "Not moving", true: "Moving" }
  },
  {
    id: 35,
    label: "occupancy",
    states: { false: "Clear", true: "Detected" }
  },
  { id: 17, label: "opening", states: { false: "Closed", true: "Open" } },
  {
    id: 36,
    label: "plug",
    states: { false: "Unplugged", true: "Plugged in" }
  },
  { id: 16, label: "power", states: { false: "Off", true: "On" } },
  { id: 37, label: "presence", states: { false: "Away", true: "Home" } },
  { id: 38, label: "problem", states: { false: "OK", true: "Problem" } },
  {
    id: 39,
    label: "running",
    states: { false: "Not Running", true: "Running" }
  },
  { id: 40, label: "safety", states: { false: "Unsafe", true: "Safe" } },
  { id: 41, label: "smoke", states: { false: "Clear", true: "Detected" } },
  { id: 42, label: "sound", states: { false: "Clear", true: "Detected" } },
  { id: 43, label: "tamper", states: { false: "Off", true: "On" } },
  {
    id: 44,
    label: "vibration",
    states: { false: "Clear", true: "Detected" }
  },
  { id: 45, label: "window", states: { false: "Closed", true: "Open" } }
];
const binarySensorDefinitions = new Map(
  binarySensorsArray.map((def) => [def.id, def])
);
class BTHomeAdvertisement {
  constructor(data) {
    if (!data || data.length < 1) {
      throw new Error(
        "A BTHome v2 advertisement frame must be at least 1 byte long"
      );
    }
    const btHomeInfoByte = data[0];
    this.encrypted = !!(btHomeInfoByte & 1);
    this.triggerBased = !!(btHomeInfoByte & 4);
    this.btHomeVersion = btHomeInfoByte >>> 5;
    if (this.btHomeVersion === 1) {
      throw new Error("BTHome v1 is not yet supported by this plugin");
    } else if (this.encrypted) {
      throw new Error(
        "Encrypted BTHome advertisements are not yet supported by this plugin"
      );
    }
    data = data.slice(1);
    const multilevelSensors = [];
    const binarySensors = [];
    const specialSensors = [];
    const events = [];
    while (data.length > 0) {
      const objectId = data[0];
      if (objectId === 0) {
        this.packetId = data[1];
        data = data.slice(2);
      } else if (multilevelSensorDefinitions.has(objectId)) {
        const def = multilevelSensorDefinitions.get(objectId);
        let value = def.signed ? data.readIntLE(1, def.size) : data.readUIntLE(1, def.size);
        if (def.factor) {
          value *= def.factor;
        }
        const sensorData = {
          label: def.label,
          value
        };
        if (def.unit) {
          sensorData.unit = def.unit;
        }
        multilevelSensors.push(sensorData);
        data = data.slice(1 + def.size);
      } else if (binarySensorDefinitions.has(objectId)) {
        const def = binarySensorDefinitions.get(objectId);
        const sensorData = {
          label: def.label,
          value: data[1] === 1,
          states: def.states
        };
        binarySensors.push(sensorData);
        data = data.slice(2);
      } else if (objectId === 58) {
        const eventId = data[1];
        const event = {
          type: "button"
        };
        if (eventId !== 0) {
          event.event = [
            "press",
            "double_press",
            "triple_press",
            "long_press",
            "long_double_press",
            "long_triple_press"
          ][eventId - 1];
        }
        events.push(event);
        data = data.slice(2);
      } else if (objectId === 60) {
        const eventId = data[1];
        const event = {
          type: "dimmer"
        };
        if (eventId !== 0) {
          event.event = {
            event: ["rotate left", "rotate right"][eventId - 1],
            steps: data[2]
          };
        }
        events.push(event);
        data = data.slice(3);
      } else if (objectId === 80) {
        const timestamp = data.readUInt32LE(1);
        specialSensors.push({
          type: "timestamp",
          value: new Date(timestamp * 1e3)
        });
        data = data.slice(5);
      } else if (objectId === 83) {
        const length = data[1];
        const value = data.slice(2, 2 + length).toString("utf8");
        specialSensors.push({
          type: "text",
          value
        });
        data = data.slice(2 + length);
      } else if (objectId === 84) {
        const length = data[1];
        const value = data.slice(2, 2 + length);
        specialSensors.push({
          type: "raw",
          value
        });
        data = data.slice(2 + length);
      } else {
        throw new Error(
          `Unsupported BTHome object ID ${objectId.toString(16)}`
        );
      }
    }
    this.multilevelSensors = multilevelSensors;
    this.binarySensors = binarySensors;
    this.specialSensors = specialSensors;
    this.events = events;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BTHomeAdvertisement
});
//# sourceMappingURL=bthome_protocol.js.map
