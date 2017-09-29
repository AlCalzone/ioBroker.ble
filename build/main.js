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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var global_1 = require("./lib/global");
var utils_1 = require("./lib/utils");
// Load all registered plugins
var plugins_1 = require("./plugins");
var enabledPlugins;
var services = [];
/** MAC addresses of known devices */
var knownDevices = [];
/** How frequent the RSSI of devices should be updated */
var rssiUpdateInterval = 0;
// noble-Treiber-Instanz
var noble;
// Adapter-Objekt erstellen
var adapter = utils_1.default.adapter({
    name: "ble",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: function () { return __awaiter(_this, void 0, void 0, function () {
        var enabledPluginNames, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Adapter-Instanz global machen
                    adapter = global_1.Global.extend(adapter);
                    global_1.Global.adapter = adapter;
                    // Workaround für fehlende InstanceObjects nach update
                    return [4 /*yield*/, global_1.Global.ensureInstanceObjects()];
                case 1:
                    // Workaround für fehlende InstanceObjects nach update
                    _d.sent();
                    // Plugins laden
                    global_1.Global.log("loaded plugins: " + plugins_1.default.map(function (p) { return p.name; }).join(", "));
                    enabledPluginNames = (adapter.config.plugins || "")
                        .split(",")
                        .map(function (p) { return p.trim().toLowerCase(); })
                        .concat("_default");
                    enabledPlugins = plugins_1.default.filter(function (p) { return enabledPluginNames.indexOf(p.name.toLowerCase()) > -1; });
                    global_1.Global.log("enabled plugins: " + enabledPlugins.map(function (p) { return p.name; }).join(", "));
                    // Bring the monitored service names into the correct form
                    services =
                        (_c = adapter.config.services.split(",")) // get manually defined services
                        .concat.apply(_c, enabledPlugins.map(function (p) { return p.advertisedServices; })).reduce(function (acc, s) { return acc.concat(s); }, []) // flatten the arrays
                            .map(function (s) { return fixServiceName(s); }) // cleanup the names
                            .filter(function (s) { return s != null && s !== ""; })
                            .reduce(function (acc, s) {
                            if (acc.indexOf(s) === -1)
                                acc.push(s);
                            return acc;
                        }, []);
                    global_1.Global.log("monitored services: " + services.join(", "));
                    // Limit RSSI updates
                    if (adapter.config.rssiThrottle != null) {
                        rssiUpdateInterval = Math.max(0, Math.min(10000, adapter.config.rssiThrottle));
                    }
                    adapter.subscribeStates("*");
                    adapter.subscribeObjects("*");
                    _b = (_a = Object).keys;
                    return [4 /*yield*/, global_1.Global.$$(adapter.namespace + ".*", "device")];
                case 2:
                    // Find all known devices
                    knownDevices = _b.apply(_a, [_d.sent()]);
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
    objectChange: function (id, obj) { },
    // is called if a subscribed state changes
    stateChange: function (id, state) { },
    message: function (obj) { return __awaiter(_this, void 0, void 0, function () {
        // responds to the adapter that sent the original message
        function respond(response) {
            if (obj.callback)
                adapter.sendTo(obj.from, obj.command, response, obj.callback);
        }
        // make required parameters easier
        function requireParams(params) {
            if (!(params && params.length))
                return true;
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var param = params_1[_i];
                if (!(obj.message && obj.message.hasOwnProperty(param))) {
                    respond(predefinedResponses.MISSING_PARAMETER(param));
                    return false;
                }
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
    if (name == null)
        return "";
    name = name.trim();
    // No whitespace
    for (var _i = 0, _a = ["\r", "\n", "\t", " "]; _i < _a.length; _i++) {
        var char = _a[_i];
        name = name.replace(char, "");
    }
    // No leading 0x
    name = name.replace(/^0x/, "");
    // lowerCase
    return name.toLowerCase();
}
function onDiscover(peripheral) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceId, plugin, _i, enabledPlugins_1, p, objects, rssiState, values, _a, _b, stateId, iobStateId;
        return __generator(this, function (_c) {
            switch (_c.label) {
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
                    if (!(peripheral.advertisement && peripheral.advertisement.serviceData && peripheral.advertisement.serviceData.length > 0))
                        return [2 /*return*/];
                    deviceId = peripheral.address;
                    for (_i = 0, enabledPlugins_1 = enabledPlugins; _i < enabledPlugins_1.length; _i++) {
                        p = enabledPlugins_1[_i];
                        if (p.isHandling(peripheral)) {
                            global_1.Global.log("plugin " + p.name + " is handling " + deviceId, "debug");
                            plugin = p;
                            break;
                        }
                    }
                    if (!plugin) {
                        global_1.Global.log("no handling plugin found for peripheral " + peripheral.id, "warn");
                        return [2 /*return*/];
                    }
                    if (!(knownDevices.indexOf(deviceId) === -1)) return [3 /*break*/, 6];
                    global_1.Global.log("adding objects for " + deviceId, "debug");
                    objects = plugin.defineObjects(peripheral);
                    // create the device object
                    return [4 /*yield*/, adapter.$setObject(deviceId, {
                            type: "device",
                            common: Object.assign({
                                name: peripheral.advertisement.localName,
                            }, objects.device.common || {}),
                            native: Object.assign({
                                id: peripheral.id,
                                address: peripheral.address,
                                addressType: peripheral.addressType,
                                connectable: peripheral.connectable,
                            }, objects.device.native || {}),
                        })];
                case 1:
                    // create the device object
                    _c.sent();
                    if (!(objects.channels != null && objects.channels.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all(objects.channels.map(function (c) {
                            return adapter.$setObject(deviceId + "." + c.id, {
                                type: "channel",
                                common: c.common,
                                native: c.native || {},
                            });
                        }))];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: 
                // create all state objects
                return [4 /*yield*/, Promise.all(objects.states.map(function (s) {
                        return adapter.$setObject(deviceId + "." + s.id, {
                            type: "state",
                            common: s.common,
                            native: s.native || {},
                        });
                    }))];
                case 4:
                    // create all state objects
                    _c.sent();
                    // also create device information states
                    return [4 /*yield*/, adapter.$setObject(deviceId + ".rssi", {
                            type: "device",
                            common: {
                                role: "indicator",
                                name: "signal strength (RSSI)",
                                desc: "Signal strength of the device",
                                type: "number",
                                read: true,
                                write: false,
                            },
                            native: {},
                        })];
                case 5:
                    // also create device information states
                    _c.sent();
                    knownDevices.push(deviceId);
                    _c.label = 6;
                case 6: return [4 /*yield*/, adapter.$getState(deviceId + ".rssi")];
                case 7:
                    rssiState = _c.sent();
                    if (!(rssiState == null ||
                        (rssiState.val !== peripheral.rssi && // only save changes
                            rssiState.lc + rssiUpdateInterval < Date.now())) // and dont update too frequently
                    ) return [3 /*break*/, 9]; // and dont update too frequently
                    global_1.Global.log("updating rssi state for " + deviceId, "debug");
                    return [4 /*yield*/, adapter.$setState(deviceId + ".rssi", peripheral.rssi, true)];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    values = plugin.getValues(peripheral);
                    global_1.Global.log(deviceId + " > got values: " + JSON.stringify(values), "debug");
                    _a = 0, _b = Object.keys(values);
                    _c.label = 10;
                case 10:
                    if (!(_a < _b.length)) return [3 /*break*/, 15];
                    stateId = _b[_a];
                    iobStateId = adapter.namespace + "." + deviceId + "." + stateId;
                    return [4 /*yield*/, adapter.$getObject(iobStateId)];
                case 11:
                    if (!((_c.sent()) != null)) return [3 /*break*/, 13];
                    global_1.Global.log("setting state " + iobStateId, "debug");
                    return [4 /*yield*/, adapter.$setStateChanged(iobStateId, values[stateId], true)];
                case 12:
                    _c.sent();
                    return [3 /*break*/, 14];
                case 13:
                    global_1.Global.log("skipping state " + iobStateId, "debug");
                    _c.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 10];
                case 15: return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJkOi9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkE0VUE7O0FBNVVBLCtDQUFxQztBQUNyQyx1Q0FBNEQ7QUFDNUQscUNBQWdDO0FBRWhDLDhCQUE4QjtBQUM5QixxQ0FBZ0M7QUFFaEMsSUFBSSxjQUF3QixDQUFDO0FBQzdCLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUU1QixxQ0FBcUM7QUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0FBRWhDLHlEQUF5RDtBQUN6RCxJQUFJLGtCQUFrQixHQUFXLENBQUMsQ0FBQztBQUVuQyx3QkFBd0I7QUFDeEIsSUFBSSxLQUFLLENBQUM7QUFFViwyQkFBMkI7QUFDM0IsSUFBSSxPQUFPLEdBQW9CLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUMsSUFBSSxFQUFFLEtBQUs7SUFFWCw2RUFBNkU7SUFDN0UsY0FBYztJQUNkLEtBQUssRUFBRTs7Ozs7b0JBRU4sZ0NBQWdDO29CQUNoQyxPQUFPLEdBQUcsZUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUIsZUFBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBRXBCLHNEQUFzRDtvQkFDdEQscUJBQU0sZUFBQyxDQUFDLHFCQUFxQixFQUFFLEVBQUE7O29CQUQvQixzREFBc0Q7b0JBQ3RELFNBQStCLENBQUM7b0JBRWhDLGdCQUFnQjtvQkFDaEIsZUFBQyxDQUFDLEdBQUcsQ0FBQyxxQkFBbUIsaUJBQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO29CQUMxRCxrQkFBa0IsR0FBYSxDQUFDLE9BQU8sQ0FBQyxNQUFN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