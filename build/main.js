"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("@iobroker/adapter-core");
const child_process_1 = require("child_process");
const custom_subscriptions_1 = require("./lib/custom-subscriptions");
const global_1 = require("./lib/global");
const iobroker_objects_1 = require("./lib/iobroker-objects");
const object_cache_1 = require("./lib/object-cache");
// Load all registered plugins
const plugins_1 = require("./plugins");
let enabledPlugins;
let services = [];
/** Whether new devices may be recorded */
let allowNewDevices = true;
/** Cache of new devices we already ignored */
const ignoredNewDeviceIDs = new Set();
// /** MAC addresses of known devices */
// let knownDevices: string[] = [];
/** How frequent the RSSI of devices should be updated */
let rssiUpdateInterval = 0;
/** noble-Treiber-Instanz */
// tslint:disable-next-line:whitespace
let noble;
// Adapter-Objekt erstellen
const adapter = utils.adapter({
    name: "ble",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: () => __awaiter(void 0, void 0, void 0, function* () {
        // Adapter-Instanz global machen
        global_1.Global.adapter = adapter;
        // Cache objects for 1 minute
        global_1.Global.objectCache = new object_cache_1.ObjectCache(60000);
        // Workaround für fehlende InstanceObjects nach update
        yield global_1.Global.ensureInstanceObjects();
        // Prüfen, ob wir neue Geräte erfassen dürfen
        const allowNewDevicesState = yield adapter.getStateAsync("options.allowNewDevices");
        allowNewDevices = (allowNewDevicesState && allowNewDevicesState.val != undefined) ? allowNewDevicesState.val : true;
        yield adapter.setStateAsync("options.allowNewDevices", allowNewDevices, true);
        // Plugins laden
        global_1.Global.log(`loaded plugins: ${plugins_1.default.map(p => p.name).join(", ")}`);
        const enabledPluginNames = (adapter.config.plugins || "")
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .concat("_default");
        enabledPlugins = plugins_1.default.filter(p => enabledPluginNames.indexOf(p.name.toLowerCase()) > -1);
        global_1.Global.log(`enabled plugins: ${enabledPlugins.map(p => p.name).join(", ")}`);
        // Bring the monitored service names into the correct form
        if (adapter.config.services === "*") {
            services = [];
            global_1.Global.log(`monitoring all services`);
        }
        else {
            services =
                adapter.config.services.split(",") // get manually defined services
                    .concat(...enabledPlugins.map(p => p.advertisedServices)) // concat with plugin-defined ones
                    .reduce((acc, s) => acc.concat(s), []) // flatten the arrays
                    .map(s => fixServiceName(s)) // cleanup the names
                    .filter(s => s !== "")
                    .reduce((acc, s) => {
                    if (acc.indexOf(s) === -1)
                        acc.push(s);
                    return acc;
                }, []);
            global_1.Global.log(`monitored services: ${services.join(", ")}`);
        }
        // Limit RSSI updates
        if (adapter.config.rssiThrottle != null) {
            rssiUpdateInterval = Math.max(0, Math.min(10000, adapter.config.rssiThrottle));
        }
        // monitor our own states and objects
        adapter.subscribeStates("*");
        adapter.subscribeObjects("*");
        if (!process.env.TESTING) {
            // load noble driver with the correct device selected
            // but only if this is not a testing environment
            process.env.NOBLE_HCI_DEVICE_ID = (adapter.config.hciDevice || 0).toString();
            try {
                noble = require("@abandonware/noble");
            }
            catch (e) {
                tryCatchUnsupportedHardware(e);
                return terminate(e.message || e);
            }
            // prepare scanning for beacons
            noble.on("stateChange", (state) => {
                switch (state) {
                    case "poweredOn":
                        startScanning();
                        break;
                    case "poweredOff":
                        stopScanning();
                        break;
                }
                adapter.setState("info.driverState", state, true);
            });
            if (noble.state === "poweredOn")
                startScanning();
            adapter.setState("info.driverState", noble.state, true);
        }
    }),
    // is called when adapter shuts down - callback has to be called under any circumstances!
    unload: (callback) => {
        try {
            stopScanning();
            noble.removeAllListeners("stateChange");
            callback();
        }
        catch (e) {
            callback();
        }
    },
    // is called if a subscribed object changes
    objectChange: (id, obj) => {
        if (!!obj) {
            // it has just been changed, so update the cached object
            global_1.Global.objectCache.updateObject(obj);
        }
        else {
            // it has been deleted, so delete it from the cache
            global_1.Global.objectCache.invalidateObject(id);
        }
        // apply additional subscriptions we've defined
        custom_subscriptions_1.applyCustomObjectSubscriptions(id, obj);
    },
    // is called if a subscribed state changes
    stateChange: (id, state) => {
        if (/options\.allowNewDevices$/.test(id) && state != undefined && !state.ack) {
            if (typeof state.val === "boolean") {
                allowNewDevices = state.val;
                // ACK the state change
                global_1.Global.adapter.setState(id, state.val, true);
                // Whenever allowNewDevices is set to true,
                // forget all devices we previously ignored
                if (allowNewDevices)
                    ignoredNewDeviceIDs.clear();
            }
        }
        // apply additional subscriptions we've defined
        custom_subscriptions_1.applyCustomStateSubscriptions(id, state);
    },
    message: (obj) => __awaiter(void 0, void 0, void 0, function* () {
        // responds to the adapter that sent the original message
        function respond(response) {
            if (obj.callback)
                adapter.sendTo(obj.from, obj.command, response, obj.callback);
        }
        // some predefined responses so we only have to define them once
        const predefinedResponses = {
            ACK: { error: null },
            OK: { error: null, result: "ok" },
            ERROR_UNKNOWN_COMMAND: { error: "Unknown command!" },
            MISSING_PARAMETER: (paramName) => {
                return { error: 'missing parameter "' + paramName + '"!' };
            },
            COMMAND_RUNNING: { error: "command running" },
        };
        // make required parameters easier
        function requireParams(params) {
            if (!(params && params.length))
                return true;
            for (const param of params) {
                if (!(obj.message && obj.message.hasOwnProperty(param))) {
                    respond(predefinedResponses.MISSING_PARAMETER(param));
                    return false;
                }
            }
            return true;
        }
        // handle the message
        if (obj) {
            switch (obj.command) {
                case "getHCIPorts":
                    child_process_1.exec("hciconfig | grep hci", (error, stdout, stderr) => {
                        // hci1:   Type: BR/EDR  Bus: USB
                        // hci0:   Type: BR/EDR  Bus: UART
                        if (error != null) {
                            global_1.Global.log(JSON.stringify(error));
                            respond({ error });
                            return;
                        }
                        // parse index and bus type
                        const ports = [];
                        const regex = /^hci(\d+)\:.+Bus\:\s(\w+)$/gm;
                        let result;
                        while (true) {
                            result = regex.exec(stdout);
                            if (!(result && result.length))
                                break;
                            const port = { index: +result[1], bus: result[2] };
                            global_1.Global.log(JSON.stringify(port));
                            ports.push(port);
                        }
                        respond({ error: null, result: ports });
                    });
                    return;
                default:
                    respond(predefinedResponses.ERROR_UNKNOWN_COMMAND);
                    return;
            }
        }
    }),
});
// =========================
function fixServiceName(name) {
    if (name == null)
        return "";
    name = name.trim();
    // No whitespace
    for (const char of ["\r", "\n", "\t", " "]) {
        name = name.replace(char, "");
    }
    // No leading 0x
    name = name.replace(/^0x/, "");
    // lowerCase
    return name.toLowerCase();
}
function onDiscover(peripheral) {
    return __awaiter(this, void 0, void 0, function* () {
        if (peripheral == null)
            return;
        let serviceDataIsNotEmpty = false;
        let manufacturerDataIsNotEmpty = false;
        global_1.Global.log(`discovered peripheral ${peripheral.address}`, "debug");
        global_1.Global.log(`  has advertisement: ${peripheral.advertisement != null}`, "debug");
        if (peripheral.advertisement != null) {
            global_1.Global.log(`  has serviceData: ${peripheral.advertisement.serviceData != null}`, "debug");
            if (peripheral.advertisement.serviceData != null) {
                global_1.Global.log(`  serviceData = ${JSON.stringify(peripheral.advertisement.serviceData)}`, "debug");
                serviceDataIsNotEmpty = peripheral.advertisement.serviceData.length > 0;
            }
            global_1.Global.log(`  has manufacturerData: ${peripheral.advertisement.manufacturerData != null}`, "debug");
            if (peripheral.advertisement.manufacturerData != null) {
                global_1.Global.log(`  manufacturerData = ${peripheral.advertisement.manufacturerData.toString("hex")}`, "debug");
                manufacturerDataIsNotEmpty = peripheral.advertisement.manufacturerData.length > 0;
            }
        }
        else {
            // don't create devices for peripherals without advertised data
            return;
        }
        // create devices if we selected to allow empty devices
        // or the peripheral transmits serviceData or manufacturerData
        if (!adapter.config.allowEmptyDevices && !serviceDataIsNotEmpty && !manufacturerDataIsNotEmpty) {
            return;
        }
        const deviceId = peripheral.address;
        // find out which plugin is handling this
        let plugin;
        for (const p of enabledPlugins) {
            if (p.isHandling(peripheral)) {
                global_1.Global.log(`plugin ${p.name} is handling ${deviceId}`, "debug");
                plugin = p;
                break;
            }
        }
        if (!plugin) {
            global_1.Global.log(`no handling plugin found for peripheral ${peripheral.id}`, "warn");
            return;
        }
        // Test if we may record this device
        if (!allowNewDevices) {
            // We may not. First test if we already ignored this device
            if (ignoredNewDeviceIDs.has(deviceId))
                return;
            // If not, check if the RSSI object exists, as that exists for every one
            if (!(yield global_1.Global.objectCache.objectExists(`${global_1.Global.adapter.namespace}.${deviceId}.rssi`))) {
                // This is a new device. Remember that we need to ignore it
                ignoredNewDeviceIDs.add(deviceId);
                return;
            }
            // This is a known device
        }
        // Always ensure the rssi state exists and gets a value
        yield iobroker_objects_1.extendState(`${deviceId}.rssi`, {
            id: "rssi",
            common: {
                role: "value.rssi",
                name: "signal strength (RSSI)",
                desc: "Signal strength of the device",
                type: "number",
                read: true,
                write: false,
            },
            native: {},
        });
        // update RSSI information
        const rssiState = yield adapter.getStateAsync(`${deviceId}.rssi`);
        if (rssiState == null ||
            (rssiState.val !== peripheral.rssi && // only save changes
                rssiState.lc + rssiUpdateInterval < Date.now()) // and dont update too frequently
        ) {
            global_1.Global.log(`updating rssi state for ${deviceId}`, "debug");
            yield adapter.setStateAsync(`${deviceId}.rssi`, peripheral.rssi, true);
        }
        // Now update device-specific objects and states
        const context = plugin.createContext(peripheral);
        const objects = plugin.defineObjects(context);
        const values = plugin.getValues(context);
        // We can't do anything without objects
        if (objects == null)
            return;
        // Ensure the device object exists
        yield iobroker_objects_1.extendDevice(deviceId, peripheral, objects.device);
        // Ensure the channel objects exist (optional)
        if (objects.channels != null && objects.channels.length > 0) {
            yield Promise.all(objects.channels.map(c => iobroker_objects_1.extendChannel(deviceId + "." + c.id, c)));
        }
        // Ensure the state objects exist. These might change in every advertisement frame
        yield Promise.all(objects.states.map(s => iobroker_objects_1.extendState(deviceId + "." + s.id, s)));
        // Now fill the states with values
        if (values != null) {
            global_1.Global.log(`${deviceId} > got values: ${JSON.stringify(values)}`, "debug");
            for (let stateId of Object.keys(values)) {
                // Fix special chars
                stateId = stateId.replace(/[\(\)]+/g, "").replace(" ", "_");
                // set the value if there's an object for the state
                const iobStateId = `${adapter.namespace}.${deviceId}.${stateId}`;
                if ((yield global_1.Global.objectCache.getObject(iobStateId)) != null) {
                    global_1.Global.log(`setting state ${iobStateId}`, "debug");
                    yield adapter.setStateChangedAsync(iobStateId, values[stateId], true);
                }
                else {
                    global_1.Global.log(`skipping state ${iobStateId} because the object does not exist`, "warn");
                }
            }
        }
        else {
            global_1.Global.log(`${deviceId} > got no values`, "debug");
        }
    });
}
let isScanning = false;
function startScanning() {
    if (isScanning)
        return;
    adapter.setState("info.connection", true, true);
    noble.on("discover", onDiscover);
    global_1.Global.log(`starting scan for services ${JSON.stringify(services)}`);
    noble.startScanning(services, true);
    isScanning = true;
}
function stopScanning() {
    if (!isScanning)
        return;
    noble.removeAllListeners("discover");
    global_1.Global.log(`stopping scan`);
    noble.stopScanning();
    adapter.setState("info.connection", false, true);
    isScanning = false;
}
function tryCatchUnsupportedHardware(err) {
    if (/compatible USB Bluetooth/.test(err.message)
        || /LIBUSB_ERROR_NOT_SUPPORTED/.test(err.message)) {
        return terminate("No compatible BLE 4.0 hardware found!");
    }
}
function terminate(reason = "no reason given") {
    if (adapter) {
        adapter.log.error(`Terminating because ${reason}`);
        if (adapter.terminate) {
            return adapter.terminate(reason);
        }
    }
    return process.exit(11);
}
// wotan-disable no-useless-predicate
process.on("unhandledRejection", r => {
    (adapter && adapter.log || console).error("unhandled promise rejection: " + r);
});
process.on("uncaughtException", err => {
    // Noble on Windows seems to throw in a callback we cannot catch
    tryCatchUnsupportedHardware(err);
    (adapter && adapter.log || console).error("unhandled exception:" + err.message);
    (adapter && adapter.log || console).error("> stack: " + err.stack);
    return process.exit(1);
});
