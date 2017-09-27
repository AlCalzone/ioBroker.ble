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
        var plugin, _i, enabledPlugins_1, p, deviceId, objects, values, _a, _b, stateId, iobStateId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData && peripheral.advertisement.serviceData.length > 0))
                        return [2 /*return*/];
                    for (_i = 0, enabledPlugins_1 = enabledPlugins; _i < enabledPlugins_1.length; _i++) {
                        p = enabledPlugins_1[_i];
                        if (p.isHandling(peripheral)) {
                            plugin = p;
                            break;
                        }
                    }
                    if (!plugin) {
                        global_1.Global.log("no handling plugin found for peripheral " + peripheral.id, "warn");
                        return [2 /*return*/];
                    }
                    deviceId = peripheral.address;
                    if (!(knownDevices.indexOf(deviceId) === -1)) return [3 /*break*/, 6];
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
                case 6: 
                // update RSSI information
                return [4 /*yield*/, adapter.$setStateChanged(deviceId + ".rssi", peripheral.rssi, true)];
                case 7:
                    // update RSSI information
                    _c.sent();
                    values = plugin.getValues(peripheral);
                    global_1.Global.log(deviceId + " > got values: " + JSON.stringify(values), "debug");
                    _a = 0, _b = Object.keys(values);
                    _c.label = 8;
                case 8:
                    if (!(_a < _b.length)) return [3 /*break*/, 13];
                    stateId = _b[_a];
                    iobStateId = adapter.namespace + "." + deviceId + "." + stateId;
                    return [4 /*yield*/, adapter.$getObject(iobStateId)];
                case 9:
                    if (!((_c.sent()) != null)) return [3 /*break*/, 11];
                    global_1.Global.log("setting state " + iobStateId, "debug");
                    return [4 /*yield*/, adapter.$setStateChanged(iobStateId, values[stateId], true)];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 12];
                case 11:
                    global_1.Global.log("skipping state " + iobStateId, "debug");
                    _c.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 8];
                case 13: return [2 /*return*/];
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
    noble.startScanning(services, true);
    isScanning = true;
}
function stopScanning() {
    if (!isScanning)
        return;
    noble.removeAllListeners("discover");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJkOi9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkE0U0E7O0FBNVNBLCtDQUFxQztBQUNyQyx1Q0FBNEQ7QUFDNUQscUNBQWdDO0FBRWhDLDhCQUE4QjtBQUM5QixxQ0FBZ0M7QUFFaEMsSUFBSSxjQUF3QixDQUFDO0FBQzdCLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUU1QixxQ0FBcUM7QUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0FBRWhDLHdCQUF3QjtBQUN4QixJQUFJLEtBQUssQ0FBQztBQUVWLDJCQUEyQjtBQUMzQixJQUFJLE9BQU8sR0FBb0IsZUFBSyxDQUFDLE9BQU8sQ0FBQztJQUM1QyxJQUFJLEVBQUUsS0FBSztJQUVYLDZFQUE2RTtJQUM3RSxjQUFjO0lBQ2QsS0FBSyxFQUFFOzs7OztvQkFFTixnQ0FBZ0M7b0JBQ2hDLE9BQU8sR0FBRyxlQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM1QixlQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztvQkFFcEIsc0RBQXNEO29CQUN0RCxxQkFBTSxlQUFDLENBQUMscUJBQXFCLEVBQUUsRUFBQTs7b0JBRC9CLHNEQUFzRDtvQkFDdEQsU0FBK0IsQ0FBQztvQkFFaEMsZ0JBQWdCO29CQUNoQixlQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFtQixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7b0JBQzFELGtCQUFrQixHQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFpQixJQUFJLEVBQUUsQ0FBQzt5QkFDM0UsS0FBSyxDQUFDLEdB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