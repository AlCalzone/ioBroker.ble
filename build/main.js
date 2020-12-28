"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("@iobroker/adapter-core");
const objects_1 = require("alcalzone-shared/objects");
const child_process_1 = require("child_process");
const path = require("path");
const global_1 = require("./lib/global");
const iobroker_objects_1 = require("./lib/iobroker-objects");
const object_cache_1 = require("./lib/object-cache");
const scanProcessInterface_1 = require("./lib/scanProcessInterface");
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
/** A reference to the scanning process */
let scanProcess;
// Adapter-Objekt erstellen
const adapter = utils.adapter({
    name: "ble",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: async () => {
        // Adapter-Instanz global machen
        global_1.Global.adapter = adapter;
        // Cache objects for 1 minute
        global_1.Global.objectCache = new object_cache_1.ObjectCache(60000);
        // Workaround für fehlende InstanceObjects nach update
        await global_1.Global.ensureInstanceObjects();
        // Prüfen, ob wir neue Geräte erfassen dürfen
        const allowNewDevicesState = await adapter.getStateAsync("options.allowNewDevices");
        allowNewDevices =
            allowNewDevicesState && allowNewDevicesState.val != undefined
                ? allowNewDevicesState.val
                : true;
        await adapter.setStateAsync("options.allowNewDevices", allowNewDevices, true);
        // Plugins laden
        global_1.Global.adapter.log.info(`loaded plugins: ${plugins_1.default.map((p) => p.name).join(", ")}`);
        const enabledPluginNames = (adapter.config.plugins || "")
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .concat("_default");
        enabledPlugins = plugins_1.default.filter((p) => enabledPluginNames.indexOf(p.name.toLowerCase()) > -1);
        global_1.Global.adapter.log.info(`enabled plugins: ${enabledPlugins.map((p) => p.name).join(", ")}`);
        // Bring the monitored service names into the correct form
        if (adapter.config.services === "*") {
            services = [];
            global_1.Global.adapter.log.info(`monitoring all services`);
        }
        else {
            services = adapter.config.services
                .split(",") // get manually defined services
                .concat(...enabledPlugins.map((p) => p.advertisedServices)) // concat with plugin-defined ones
                .reduce((acc, s) => acc.concat(s), []) // flatten the arrays
                .map((s) => fixServiceName(s)) // cleanup the names
                .filter((s) => s !== "")
                .reduce((acc, s) => {
                // filter out duplicates
                if (acc.indexOf(s) === -1)
                    acc.push(s);
                return acc;
            }, []);
            global_1.Global.adapter.log.info(`monitored services: ${services.join(", ")}`);
        }
        // Limit RSSI updates
        if (adapter.config.rssiThrottle != null) {
            rssiUpdateInterval = Math.max(0, Math.min(10000, adapter.config.rssiThrottle));
        }
        // monitor our own states and objects
        adapter.subscribeStates("*");
        adapter.subscribeObjects("*");
        // And start scanning
        if (!process.env.TESTING)
            startScanProcess();
    },
    // is called when adapter shuts down - callback has to be called under any circumstances!
    unload: (callback) => {
        try {
            scanProcess === null || scanProcess === void 0 ? void 0 : scanProcess.kill();
        }
        catch (_a) { }
        callback();
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
    },
    // is called if a subscribed state changes
    stateChange: (id, state) => {
        if (/options\.allowNewDevices$/.test(id) &&
            state != undefined &&
            !state.ack) {
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
    },
    message: async (obj) => {
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
        // function requireParams(params: string[]) {
        // 	if (!(params && params.length)) return true;
        // 	for (const param of params) {
        // 		if (!(obj.message && obj.message.hasOwnProperty(param))) {
        // 			respond(predefinedResponses.MISSING_PARAMETER(param));
        // 			return false;
        // 		}
        // 	}
        // 	return true;
        // }
        // handle the message
        if (obj) {
            switch (obj.command) {
                case "getHCIPorts":
                    child_process_1.exec("hciconfig | grep hci", (error, stdout, _stderr) => {
                        // hci1:   Type: BR/EDR  Bus: USB
                        // hci0:   Type: BR/EDR  Bus: UART
                        if (error != null) {
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
    },
});
function startScanProcess() {
    const args = ["-s", ...services];
    if (adapter.config.hciDevice) {
        args.push("-d", adapter.config.hciDevice.toString());
    }
    adapter.log.info("starting scanner process...");
    scanProcess = child_process_1.fork(path.join(__dirname, "scanProcess"), args, {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
    }).on("exit", (code, signal) => {
        if (!signal &&
            code !== 0 &&
            code !== scanProcessInterface_1.ScanExitCodes.RequireNobleFailed) {
            adapter.log.warn("scanner process crashed, restarting...");
            setImmediate(startScanProcess);
        }
        else {
            scanProcess = undefined;
        }
    });
    scanProcess.on("message", scanProcessInterface_1.getMessageReviver((message) => {
        var _a;
        switch (message.type) {
            case "connected":
                adapter.setState("info.connection", true, true);
                break;
            case "disconnected":
                adapter.setState("info.connection", false, true);
                break;
            case "discover":
                onDiscover(message.peripheral);
                break;
            case "driverState":
                adapter.setState("info.driverState", message.driverState, true);
                break;
            case "error": // fall through
            case "fatal":
                handleScanProcessError(message.error);
                break;
            case "log":
                adapter.log[(_a = message.level) !== null && _a !== void 0 ? _a : "info"](message.message);
                break;
        }
    }));
}
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
async function onDiscover(peripheral) {
    if (peripheral == null)
        return;
    let serviceDataIsNotEmpty = false;
    let manufacturerDataIsNotEmpty = false;
    global_1.Global.adapter.log.debug(`discovered peripheral ${peripheral.address}`);
    global_1.Global.adapter.log.debug(`  has advertisement: ${peripheral.advertisement != null}`);
    if (peripheral.advertisement != null) {
        global_1.Global.adapter.log.debug(`  has serviceData: ${peripheral.advertisement.serviceData != null}`);
        if (peripheral.advertisement.serviceData != null) {
            global_1.Global.adapter.log.debug(`  serviceData = ${JSON.stringify(peripheral.advertisement.serviceData)}`);
            serviceDataIsNotEmpty =
                peripheral.advertisement.serviceData.length > 0;
        }
        global_1.Global.adapter.log.debug(`  has manufacturerData: ${peripheral.advertisement.manufacturerData != null}`);
        if (peripheral.advertisement.manufacturerData != null) {
            global_1.Global.adapter.log.debug(`  manufacturerData = ${peripheral.advertisement.manufacturerData.toString("hex")}`);
            manufacturerDataIsNotEmpty =
                peripheral.advertisement.manufacturerData.length > 0;
        }
    }
    else {
        // don't create devices for peripherals without advertised data
        return;
    }
    // create devices if we selected to allow empty devices
    // or the peripheral transmits serviceData or manufacturerData
    if (!adapter.config.allowEmptyDevices &&
        !serviceDataIsNotEmpty &&
        !manufacturerDataIsNotEmpty) {
        return;
    }
    const deviceId = peripheral.address;
    // find out which plugin is handling this
    let plugin;
    for (const p of enabledPlugins) {
        if (p.isHandling(peripheral)) {
            global_1.Global.adapter.log.debug(`plugin ${p.name} is handling ${deviceId}`);
            plugin = p;
            break;
        }
    }
    if (!plugin) {
        global_1.Global.adapter.log.warn(`no handling plugin found for peripheral ${peripheral.id}`);
        return;
    }
    // Test if we may record this device
    if (!allowNewDevices) {
        // We may not. First test if we already ignored this device
        if (ignoredNewDeviceIDs.has(deviceId))
            return;
        // If not, check if the RSSI object exists, as that exists for every one
        if (!(await global_1.Global.objectCache.objectExists(`${global_1.Global.adapter.namespace}.${deviceId}.rssi`))) {
            // This is a new device. Remember that we need to ignore it
            ignoredNewDeviceIDs.add(deviceId);
            return;
        }
        // This is a known device
    }
    // Always ensure the rssi state exists and gets a value
    await iobroker_objects_1.extendState(`${deviceId}.rssi`, {
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
    const rssiState = await adapter.getStateAsync(`${deviceId}.rssi`);
    if (rssiState == null ||
        // Allow updating the unchanged state because some people use it for presence detection
        rssiState.ts + rssiUpdateInterval < Date.now() // But don't update too frequently
    ) {
        global_1.Global.adapter.log.debug(`updating rssi state for ${deviceId}`);
        await adapter.setStateAsync(`${deviceId}.rssi`, peripheral.rssi, true);
    }
    // Now update device-specific objects and states
    const context = plugin.createContext(peripheral);
    const objects = plugin.defineObjects(context);
    const values = plugin.getValues(context);
    // We can't do anything without objects
    if (objects == null)
        return;
    // Ensure the device object exists
    await iobroker_objects_1.extendDevice(deviceId, peripheral, objects.device);
    // Ensure the channel objects exist (optional)
    if (objects.channels != null && objects.channels.length > 0) {
        await Promise.all(objects.channels.map((c) => iobroker_objects_1.extendChannel(deviceId + "." + c.id, c)));
    }
    // Ensure the state objects exist. These might change in every advertisement frame
    await Promise.all(objects.states.map((s) => iobroker_objects_1.extendState(deviceId + "." + s.id, s)));
    // Now fill the states with values
    if (values != null) {
        global_1.Global.adapter.log.debug(`${deviceId} > got values: ${JSON.stringify(values)}`);
        // eslint-disable-next-line prefer-const
        for (let [stateId, value] of objects_1.entries(values)) {
            // Fix special chars
            stateId = stateId.replace(/[\(\)]+/g, "").replace(" ", "_");
            // set the value if there's an object for the state
            const iobStateId = `${adapter.namespace}.${deviceId}.${stateId}`;
            if ((await global_1.Global.objectCache.getObject(iobStateId)) != null) {
                global_1.Global.adapter.log.debug(`setting state ${iobStateId}`);
                await adapter.setStateChangedAsync(iobStateId, value !== null && value !== void 0 ? value : null, true);
            }
            else {
                global_1.Global.adapter.log.warn(`skipping state ${iobStateId} because the object does not exist`);
            }
        }
    }
    else {
        global_1.Global.adapter.log.debug(`${deviceId} > got no values`);
    }
}
function handleScanProcessError(err) {
    var _a, _b, _c;
    if (/compatible USB Bluetooth/.test(err.message) ||
        /LIBUSB_ERROR_NOT_SUPPORTED/.test(err.message)) {
        terminate("No compatible BLE 4.0 hardware found!");
    }
    else if (/NODE_MODULE_VERSION/.test(err.message) && ((_a = adapter.supportsFeature) === null || _a === void 0 ? void 0 : _a.call(adapter, "CONTROLLER_NPM_AUTO_REBUILD"))) {
        terminate("A dependency requires a rebuild.", 13);
    }
    else if (err.message.includes(`The value of "offset" is out of range`)) {
        // ignore, this happens in noble sometimes
        ((_b = adapter === null || adapter === void 0 ? void 0 : adapter.log) !== null && _b !== void 0 ? _b : console).error(err.message);
    }
    else if (err.message.includes("EAFNOSUPPORT")) {
        terminate("Unsupported Address Family (EAFNOSUPPORT). If ioBroker is running in a Docker container, make sure that the container uses host mode networking.");
    }
    else {
        // This is something unexpected. We don't want to bring down the main process, so just log it
        ((_c = adapter === null || adapter === void 0 ? void 0 : adapter.log) !== null && _c !== void 0 ? _c : console).error(err.message);
    }
}
function terminate(reason = "no reason given", exitCode = 11) {
    var _a;
    if (adapter) {
        adapter.log.error(`Terminating because ${reason}`);
        (_a = adapter.terminate) === null || _a === void 0 ? void 0 : _a.call(adapter, reason, exitCode);
    }
    return process.exit(exitCode);
}
//# sourceMappingURL=main.js.map