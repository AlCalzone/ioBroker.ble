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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var yargs = __toESM(require("yargs"));
var import_misc = require("./lib/misc");
var import_scanProcessInterface = require("./lib/scanProcessInterface");
const argv = yargs.env("IOB_BLE").strict().usage("ioBroker.ble scanner process\n\nUsage: $0 [options]").options({
  hciDevice: {
    alias: "-d",
    type: "number",
    desc: "Index of the HCI device to use for scanning",
    default: 0
  },
  services: {
    alias: "-s",
    type: "array",
    desc: "Which BLE services to scan for",
    default: []
  }
}).parseSync();
let noble;
function sendAsync(message, sendHandle, swallowErrors = true) {
  return new Promise((resolve, reject) => {
    process.send(message, sendHandle, void 0, (err) => {
      if (err && !swallowErrors)
        reject(err);
      else
        resolve();
    });
  });
}
Error.prototype.toJSON = function() {
  const ret = {
    type: "Error",
    name: this.name,
    message: this.message,
    stack: this.stack
  };
  for (const key of Object.keys(this)) {
    if (!ret[key]) {
      ret[key] = this[key];
    }
  }
  return ret;
};
process.on("uncaughtException", (error) => {
  sendAsync({ type: "error", error });
});
process.on("unhandledRejection", (error) => {
  sendAsync({
    type: "error",
    error: error instanceof Error ? error : new Error(`${error}`)
  });
});
function serializePeripheral(peripheral) {
  return (0, import_misc.pick)(peripheral, [
    "id",
    "uuid",
    "address",
    "addressType",
    "connectable",
    "advertisement",
    "rssi",
    "services",
    "state"
  ]);
}
function onDiscover(peripheral) {
  if (peripheral == void 0)
    return;
  sendAsync({
    type: "discover",
    peripheral: serializePeripheral(peripheral)
  });
}
let isScanning = false;
async function startScanning() {
  if (isScanning)
    return;
  await sendAsync({ type: "connected" });
  await sendAsync({
    type: "log",
    message: `starting scan for services ${JSON.stringify(argv.services)}`
  });
  noble.on("discover", onDiscover);
  await noble.startScanningAsync(argv.services, true);
  isScanning = true;
}
async function stopScanning() {
  if (!isScanning)
    return;
  noble.removeAllListeners("discover");
  sendAsync({
    type: "log",
    message: `stopping scan`
  });
  noble.stopScanning();
  sendAsync({ type: "disconnected" });
  isScanning = false;
}
(async () => {
  process.env.NOBLE_HCI_DEVICE_ID = argv.hciDevice.toString();
  try {
    noble = require("@abandonware/noble");
    if (typeof noble.on !== "function") {
      noble = noble({ extended: false });
    }
  } catch (error) {
    await sendAsync({ type: "fatal", error });
    process.exit(import_scanProcessInterface.ScanExitCodes.RequireNobleFailed);
  }
  noble.on("stateChange", (state) => {
    switch (state) {
      case "poweredOn":
        startScanning();
        break;
      case "poweredOff":
        stopScanning();
        break;
    }
    sendAsync({ type: "driverState", driverState: state });
  });
  if (noble.state === "poweredOn")
    startScanning();
  sendAsync({ type: "driverState", driverState: noble.state });
})();
//# sourceMappingURL=scanProcess.js.map
