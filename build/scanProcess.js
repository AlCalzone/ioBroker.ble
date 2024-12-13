var import_net = require("net");
var import_misc = require("./lib/misc");
var import_scanProcessInterface = require("./lib/scanProcessInterface");
const yargs = require("yargs");
const argv = yargs.env("IOB_BLE").strict().usage("ioBroker.ble scanner process\n\nUsage: $0 [options]").options({
  hciDevice: {
    alias: "-d",
    type: "number",
    desc: "Index of the HCI device to use for scanning",
    default: 0
  },
  services: {
    alias: "-s",
    type: "string",
    array: true,
    desc: "Which BLE services to scan for",
    default: []
  },
  listenInterface: {
    alias: "-i",
    type: "string",
    desc: "If not spawned as a child process, the interface to listen for TCP connections. Default: all interfaces."
  },
  listenPort: {
    alias: "-p",
    type: "number",
    desc: "If not spawned as a child process, the port to listen on.",
    default: 8734
  }
}).parseSync();
let noble;
let server;
const clients = /* @__PURE__ */ new Set();
function sendAsync(message, sendHandle, swallowErrors = true) {
  if (process.send) {
    return new Promise((resolve, reject) => {
      process.send(message, sendHandle, void 0, (err) => {
        if (err && !swallowErrors)
          reject(err);
        else
          resolve();
      });
    });
  } else {
    const promises = [...clients].map((client) => {
      return new Promise((resolve, reject) => {
        client.write(JSON.stringify(message) + "\n", (err) => {
          if (err && !swallowErrors)
            reject(err);
          else
            resolve();
        });
      });
    });
    return Promise.all(promises).then(() => void 0);
  }
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
process.on("message", (msg) => {
  handleMessage(msg);
});
function handleMessage(msg) {
  switch (msg.type) {
    case "startScanning":
      startScanning();
      break;
    case "stopScanning":
      stopScanning();
      break;
  }
}
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
function maybeStartServer() {
  if (process.send)
    return Promise.resolve();
  return new Promise((resolve, reject) => {
    server = (0, import_net.createServer)((socket) => {
      console.log("Client connected");
      clients.add(socket);
      socket.on("close", () => {
        console.log("Client disconnected");
        clients.delete(socket);
      });
    });
    server.maxConnections = 1;
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        reject(err);
      }
    });
    server.listen(
      {
        host: argv.listenInterface,
        port: argv.listenPort
      },
      () => {
        const address = server.address();
        console.log(
          `Server listening on tcp://${address.address}:${address.port}`
        );
        resolve();
      }
    );
  });
}
async function loadNoble() {
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
}
async function main() {
  noble.on("stateChange", (state) => {
    switch (state) {
      case "poweredOn":
        startScanning();
        break;
      case "poweredOff":
        stopScanning();
        break;
    }
    console.log(`driver state is ${state}`);
    sendAsync({ type: "driverState", driverState: state });
  });
  if (noble.state === "poweredOn")
    startScanning();
  sendAsync({ type: "driverState", driverState: noble.state });
}
(async () => {
  await loadNoble();
  await maybeStartServer();
  if (server) {
    server.once("connection", () => {
      main();
    });
  } else {
    main();
  }
})();
//# sourceMappingURL=scanProcess.js.map
