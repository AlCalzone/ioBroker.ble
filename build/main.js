"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var custom_subscriptions_1 = require("./lib/custom-subscriptions");
var global_1 = require("./lib/global");
var iobroker_objects_1 = require("./lib/iobroker-objects");
var object_cache_1 = require("./lib/object-cache");
var utils_1 = require("./lib/utils");
// Load all registered plugins
var plugins_1 = require("./plugins");
var enabledPlugins;
var services = [];
// /** MAC addresses of known devices */
// let knownDevices: string[] = [];
/** How frequent the RSSI of devices should be updated */
var rssiUpdateInterval = 0;
/** After which timespan inactive devices should be deleted */
var deviceLifespan = 3600000; // 1h
// noble-Treiber-Instanz
var noble;
// Adapter-Objekt erstellen
var adapter = utils_1.default.adapter({
    name: "ble",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, enabledPluginNames;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Adapter-Instanz global machen
                    adapter = global_1.Global.extend(adapter);
                    global_1.Global.adapter = adapter;
                    // Konfiguration für Geräte-Lebensdauer laden
                    if (typeof adapter.config.deviceLifespanHours === "number") {
                        deviceLifespan = adapter.config.deviceLifespanHours * 3600000;
                    }
                    // TODO: Threads starten
                    // Cache objects for 1 minute
                    global_1.Global.objectCache = new object_cache_1.ObjectCache(60000);
                    // Workaround für fehlende InstanceObjects nach update
                    return [4 /*yield*/, global_1.Global.ensureInstanceObjects()];
                case 1:
                    // Workaround für fehlende InstanceObjects nach update
                    _b.sent();
                    // Plugins laden
                    global_1.Global.log("loaded plugins: " + plugins_1.default.map(function (p) { return p.name; }).join(", "));
                    enabledPluginNames = (adapter.config.plugins || "")
                        .split(",")
                        .map(function (p) { return p.trim().toLowerCase(); })
                        .concat("_default");
                    enabledPlugins = plugins_1.default.filter(function (p) { return enabledPluginNames.indexOf(p.name.toLowerCase()) > -1; });
                    global_1.Global.log("enabled plugins: " + enabledPlugins.map(function (p) { return p.name; }).join(", "));
                    // Bring the monitored service names into the correct form
                    if (adapter.config.services === "*") {
                        services = [];
                        global_1.Global.log("monitoring all services");
                    }
                    else {
                        services =
                            // get manually defined services
                            (_a = adapter.config.services.split(",")).concat.apply(_a, __spread(enabledPlugins.map(function (p) { return p.advertisedServices; }))).reduce(function (acc, s) { return acc.concat(s); }, [])
                                // cleanup the names
                                .map(function (s) { return fixServiceName(s); })
                                .filter(function (s) { return s != null && s !== ""; })
                                // filter out duplicates
                                .reduce(function (acc, s) {
                                if (acc.indexOf(s) === -1)
                                    acc.push(s);
                                return acc;
                            }, []);
                        global_1.Global.log("monitored services: " + services.join(", "));
                    }
                    // Limit RSSI updates
                    if (adapter.config.rssiThrottle != null) {
                        rssiUpdateInterval = Math.max(0, Math.min(10000, adapter.config.rssiThrottle));
                    }
                    // monitor our own states and objects
                    adapter.subscribeStates("*");
                    adapter.subscribeObjects("*");
                    // load noble driver with the correct device selected
                    process.env.NOBLE_HCI_DEVICE_ID = adapter.config.hciDevice || 0;
                    noble = require("noble");
                    // prepare scanning for beacons
                    noble.on("stateChange", function (state) {
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
                    return [2 /*return*/];
            }
        });
    }); },
    // is called when adapter shuts down - callback has to be called under any circumstances!
    unload: function (callback) {
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
    objectChange: function (id, obj) {
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
    stateChange: function (id, state) {
        // apply additional subscriptions we've defined
        custom_subscriptions_1.applyCustomStateSubscriptions(id, state);
    },
    message: function (obj) { return __awaiter(_this, void 0, void 0, function () {
        // responds to the adapter that sent the original message
        function respond(response) {
            if (obj.callback)
                adapter.sendTo(obj.from, obj.command, response, obj.callback);
        }
        // make required parameters easier
        function requireParams(params) {
            var e_1, _a;
            if (!(params && params.length))
                return true;
            try {
                for (var params_1 = __values(params), params_1_1 = params_1.next(); !params_1_1.done; params_1_1 = params_1.next()) {
                    var param = params_1_1.value;
                    if (!(obj.message && obj.message.hasOwnProperty(param))) {
                        respond(predefinedResponses.MISSING_PARAMETER(param));
                        return false;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (params_1_1 && !params_1_1.done && (_a = params_1.return)) _a.call(params_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return true;
        }
        var predefinedResponses;
        return __generator(this, function (_a) {
            predefinedResponses = {
                ACK: { error: null },
                OK: { error: null, result: "ok" },
                ERROR_UNKNOWN_COMMAND: { error: "Unknown command!" },
                MISSING_PARAMETER: function (paramName) {
                    return { error: 'missing parameter "' + paramName + '"!' };
                },
                COMMAND_RUNNING: { error: "command running" },
            };
            // handle the message
            if (obj) {
                switch (obj.command) {
                    case "getHCIPorts":
                        child_process_1.exec("hciconfig | grep hci", function (error, stdout, stderr) {
                            // hci1:   Type: BR/EDR  Bus: USB
                            // hci0:   Type: BR/EDR  Bus: UART
                            if (error != null) {
                                global_1.Global.log(JSON.stringify(error));
                                respond({ error: error });
                                return;
                            }
                            // parse index and bus type
                            var ports = [];
                            var regex = /^hci(\d+)\:.+Bus\:\s(\w+)$/gm;
                            var result;
                            while (true) {
                                result = regex.exec(stdout);
                                if (!(result && result.length))
                                    break;
                                var port = { index: +result[1], bus: result[2] };
                                global_1.Global.log(JSON.stringify(port));
                                ports.push(port);
                            }
                            respond({ error: null, result: ports });
                        });
                        return [2 /*return*/];
                    default:
                        respond(predefinedResponses.ERROR_UNKNOWN_COMMAND);
                        return [2 /*return*/];
                }
            }
            return [2 /*return*/];
        });
    }); },
});
// =========================
function fixServiceName(name) {
    var e_2, _a;
    if (name == null)
        return "";
    name = name.trim();
    try {
        // No whitespace
        for (var _b = __values(["\r", "\n", "\t", " "]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var char = _c.value;
            name = name.replace(char, "");
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    // No leading 0x
    name = name.replace(/^0x/, "");
    // lowerCase
    return name.toLowerCase();
}
function onDiscover(peripheral) {
    return __awaiter(this, void 0, void 0, function () {
        var e_3, _a, e_4, _b, deviceId, plugin, enabledPlugins_1, enabledPlugins_1_1, p, rssiState, context, objects, values, _c, _d, stateId, iobStateId, e_4_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (peripheral == null)
                        return [2 /*return*/];
                    global_1.Global.log("discovered peripheral " + peripheral.address, "debug");
                    global_1.Global.log("  has advertisement: " + (peripheral.advertisement != null), "debug");
                    if (peripheral.advertisement != null) {
                        global_1.Global.log("  has serviceData: " + (peripheral.advertisement.serviceData != null), "debug");
                        if (peripheral.advertisement.serviceData != null) {
                            global_1.Global.log("  serviceData = " + JSON.stringify(peripheral.advertisement.serviceData), "debug");
                        }
                    }
                    // don't create devices for peripherals without advertised data
                    if (peripheral.advertisement == null)
                        return [2 /*return*/];
                    // create devices if we selected to allow empty devices
                    // or the peripheral transmits serviceData
                    if (!(adapter.config.allowEmptyDevices ||
                        (peripheral.advertisement.serviceData != null && peripheral.advertisement.serviceData.length > 0))) {
                        return [2 /*return*/];
                    }
                    deviceId = peripheral.address;
                    try {
                        for (enabledPlugins_1 = __values(enabledPlugins), enabledPlugins_1_1 = enabledPlugins_1.next(); !enabledPlugins_1_1.done; enabledPlugins_1_1 = enabledPlugins_1.next()) {
                            p = enabledPlugins_1_1.value;
                            if (p.isHandling(peripheral)) {
                                global_1.Global.log("plugin " + p.name + " is handling " + deviceId, "debug");
                                plugin = p;
                                break;
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (enabledPlugins_1_1 && !enabledPlugins_1_1.done && (_a = enabledPlugins_1.return)) _a.call(enabledPlugins_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    if (!plugin) {
                        global_1.Global.log("no handling plugin found for peripheral " + peripheral.id, "warn");
                        return [2 /*return*/];
                    }
                    // Always ensure the rssi state exists and gets a value
                    return [4 /*yield*/, iobroker_objects_1.extendState(deviceId + ".rssi", {
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
                        })];
                case 1:
                    // Always ensure the rssi state exists and gets a value
                    _e.sent();
                    return [4 /*yield*/, adapter.$getState(deviceId + ".rssi")];
                case 2:
                    rssiState = _e.sent();
                    if (!(rssiState == null ||
                        (rssiState.val !== peripheral.rssi && // only save changes
                            rssiState.lc + rssiUpdateInterval < Date.now())) // and dont update too frequently
                    ) return [3 /*break*/, 4]; // and dont update too frequently
                    global_1.Global.log("updating rssi state for " + deviceId, "debug");
                    return [4 /*yield*/, adapter.$setState(deviceId + ".rssi", peripheral.rssi, true)];
                case 3:
                    _e.sent();
                    _e.label = 4;
                case 4:
                    context = plugin.createContext(peripheral);
                    objects = plugin.defineObjects(context);
                    values = plugin.getValues(context);
                    // We can't do anything without objects
                    if (objects == null)
                        return [2 /*return*/];
                    // Ensure the device object exists
                    return [4 /*yield*/, iobroker_objects_1.extendDevice(deviceId, peripheral, objects.device)];
                case 5:
                    // Ensure the device object exists
                    _e.sent();
                    if (!(objects.channels != null && objects.channels.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, Promise.all(objects.channels.map(function (c) { return iobroker_objects_1.extendChannel(deviceId + "." + c.id, c); }))];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7: 
                // Ensure the state objects exist. These might change in every advertisement frame
                return [4 /*yield*/, Promise.all(objects.states.map(function (s) { return iobroker_objects_1.extendState(deviceId + "." + s.id, s); }))];
                case 8:
                    // Ensure the state objects exist. These might change in every advertisement frame
                    _e.sent();
                    if (!(values != null)) return [3 /*break*/, 19];
                    global_1.Global.log(deviceId + " > got values: " + JSON.stringify(values), "debug");
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 16, 17, 18]);
                    _c = __values(Object.keys(values)), _d = _c.next();
                    _e.label = 10;
                case 10:
                    if (!!_d.done) return [3 /*break*/, 15];
                    stateId = _d.value;
                    iobStateId = adapter.namespace + "." + deviceId + "." + stateId;
                    return [4 /*yield*/, global_1.Global.objectCache.getObject(iobStateId)];
                case 11:
                    if (!((_e.sent()) != null)) return [3 /*break*/, 13];
                    global_1.Global.log("setting state " + iobStateId, "debug");
                    return [4 /*yield*/, adapter.$setStateChanged(iobStateId, values[stateId], true)];
                case 12:
                    _e.sent();
                    return [3 /*break*/, 14];
                case 13:
                    global_1.Global.log("skipping state " + iobStateId + " because the object does not exist", "warn");
                    _e.label = 14;
                case 14:
                    _d = _c.next();
                    return [3 /*break*/, 10];
                case 15: return [3 /*break*/, 18];
                case 16:
                    e_4_1 = _e.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 18];
                case 17:
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 18: return [3 /*break*/, 20];
                case 19:
                    global_1.Global.log(deviceId + " > got no values", "debug");
                    _e.label = 20;
                case 20: return [2 /*return*/];
            }
        });
    });
}
var isScanning = false;
function startScanning() {
    if (isScanning)
        return;
    adapter.setState("info.connection", true, true);
    noble.on("discover", onDiscover);
    global_1.Global.log("starting scan for services " + JSON.stringify(services));
    noble.startScanning(services, true);
    isScanning = true;
}
function stopScanning() {
    if (!isScanning)
        return;
    noble.removeAllListeners("discover");
    global_1.Global.log("stopping scan");
    noble.stopScanning();
    adapter.setState("info.connection", false, true);
    isScanning = false;
}
// Unbehandelte Fehler tracen
process.on("unhandledRejection", function (r) {
    adapter.log.error("unhandled promise rejection: " + r);
});
process.on("uncaughtException", function (err) {
    adapter.log.error("unhandled exception:" + err.message);
    adapter.log.error("> stack: " + err.stack);
    process.exit(1);
});
