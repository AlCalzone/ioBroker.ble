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
                    if (adapter.config.services === "*") {
                        services = [];
                        global_1.Global.log("monitoring all services");
                    }
                    else {
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
                    }
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
                        (rssiState.val !== peripheral.rssi &&
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQTBWQTs7QUExVkEsK0NBQXFDO0FBQ3JDLHVDQUE0RDtBQUM1RCxxQ0FBZ0M7QUFFaEMsOEJBQThCO0FBQzlCLHFDQUFnQztBQUVoQyxJQUFJLGNBQXdCLENBQUM7QUFDN0IsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO0FBRTVCLHFDQUFxQztBQUNyQyxJQUFJLFlBQVksR0FBYSxFQUFFLENBQUM7QUFFaEMseURBQXlEO0FBQ3pELElBQUksa0JBQWtCLEdBQVcsQ0FBQyxDQUFDO0FBRW5DLHdCQUF3QjtBQUN4QixJQUFJLEtBQUssQ0FBQztBQUVWLDJCQUEyQjtBQUMzQixJQUFJLE9BQU8sR0FBb0IsZUFBSyxDQUFDLE9BQU8sQ0FBQztJQUM1QyxJQUFJLEVBQUUsS0FBSztJQUVYLDZFQUE2RTtJQUM3RSxjQUFjO0lBQ2QsS0FBSyxFQUFFO1lBV0Esa0JBQWtCOzs7O29CQVR4QixnQ0FBZ0M7b0JBQ2hDLE9BQU8sR0FBRyxlQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM1QixlQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztvQkFFcEIsc0RBQXNEO29CQUN0RCxxQkFBTSxlQUFDLENBQUMscUJBQXFCLEVBQUUsRUFBQTs7b0JBRC9CLHNEQUFzRDtvQkFDdEQsU0FBK0IsQ0FBQztvQkFFaEMsZ0JBQWdCO29CQUNoQixlQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFtQixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7eUNBQzNCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFpQixJQUFJLEVBQUUsQ0FBQzt5QkFDM0UsS0FBSyxDQUFDLEdBQUcsQ0FBQzt5QkFDVixHQUFHLENBQUMsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQXRCLENBQXNCLENBQUM7eUJBQzFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7b0JBRXBCLGNBQWMsR0FBRyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQXJELENBQXFELENBQUMsQ0FBQztvQkFDNUYsZUFBQyxDQUFDLEdBQUcsQ0FBQyxzQkFBb0IsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDLENBQUM7b0JBRXhFLDBEQUEwRDtvQkFDMUQsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDckMsUUFBUSxHQUFHLEVBQUUsQ0FBQzt3QkFDZCxlQUFDLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQ2xDLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ1AsUUFBUTs0QkFDUCxDQUFBLEtBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFtQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLGdDQUFnQzs2QkFDN0UsTUFBTSxXQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsa0JBQWtCLEVBQXBCLENBQW9CLENBQUMsRUFDdkQsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSyxPQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQWIsQ0FBYSxFQUFFLEVBQUUsQ0FBQyxDQUFFLHFCQUFxQjtpQ0FDNUQsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUksb0JBQW9CO2lDQUNuRCxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQXJCLENBQXFCLENBQUM7aUNBQ2xDLE1BQU0sQ0FBQyxVQUFDLEdBQVUsRUFBRSxDQUFDO2dDQUNyQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29DQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3ZDLE1BQU0sQ0FBQyxHQUFHLENBQUM7NEJBQ1osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNOO3dCQUNGLGVBQUMsQ0FBQyxHQUFHLENBQUMseUJBQXVCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQztvQkFDckQsQ0FBQztvQkFFRCxxQkFBcUI7b0JBQ3JCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3pDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDaEYsQ0FBQztvQkFFRCxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBR2YsS0FBQSxDQUFBLEtBQUEsTUFBTSxDQUFBLENBQUMsSUFBSSxDQUFBO29CQUN6QixxQkFBTSxlQUFDLENBQUMsRUFBRSxDQUFJLE9BQU8sQ0FBQyxTQUFTLE9BQUksRUFBRSxRQUFRLENBQUMsRUFBQTs7b0JBRi9DLHlCQUF5QjtvQkFDekIsWUFBWSxHQUFHLGNBQ2QsU0FBOEMsRUFDOUMsQ0FBQztvQkFFRixxREFBcUQ7b0JBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO29CQUNoRSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUV6QiwrQkFBK0I7b0JBQy9CLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSzt3QkFDN0IsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDZixLQUFLLFdBQVc7Z0NBQ2YsYUFBYSxFQUFFLENBQUM7Z0NBQ2hCLEtBQUssQ0FBQzs0QkFDUCxLQUFLLFlBQVk7Z0NBQ2hCLFlBQVksRUFBRSxDQUFDO2dDQUNmLEtBQUssQ0FBQzt3QkFDUixDQUFDO3dCQUNELE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNuRCxDQUFDLENBQUMsQ0FBQztvQkFDSCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQzt3QkFBQyxhQUFhLEVBQUUsQ0FBQztvQkFDakQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7O1NBQ3hEO0lBRUQseUZBQXlGO0lBQ3pGLE1BQU0sRUFBRSxVQUFDLFFBQVE7UUFDaEIsSUFBSSxDQUFDO1lBQ0osWUFBWSxFQUFFLENBQUM7WUFDZixLQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDeEMsUUFBUSxFQUFFLENBQUM7UUFDWixDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNaLFFBQVEsRUFBRSxDQUFDO1FBQ1osQ0FBQztJQUNGLENBQUM7SUFFRCwyQ0FBMkM7SUFDM0MsWUFBWSxFQUFFLFVBQUMsRUFBRSxFQUFFLEdBQUcsSUFBa0IsQ0FBQztJQUV6QywwQ0FBMEM7SUFDMUMsV0FBVyxFQUFFLFVBQUMsRUFBRSxFQUFFLEtBQUssSUFBa0IsQ0FBQztJQUUxQyxPQUFPLEVBQUUsVUFBTyxHQUFHO1FBQ2xCLHlEQUF5RDtRQUN6RCxpQkFBaUIsUUFBUTtZQUN4QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDO2dCQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQVdELGtDQUFrQztRQUNsQyx1QkFBdUIsTUFBTTtZQUM1QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxDQUFnQixVQUFNLEVBQU4saUJBQU0sRUFBTixvQkFBTSxFQUFOLElBQU07Z0JBQXJCLElBQU0sS0FBSyxlQUFBO2dCQUNmLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxPQUFPLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDZCxDQUFDO2FBQ0Q7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2IsQ0FBQztZQW5CSyxtQkFBbUI7O2tDQUFHO2dCQUMzQixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2dCQUNwQixFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQ2pDLHFCQUFxQixFQUFFLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFO2dCQUNwRCxpQkFBaUIsRUFBRSxVQUFDLFNBQVM7b0JBQzVCLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxxQkFBcUIsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQUM7Z0JBQzVELENBQUM7Z0JBQ0QsZUFBZSxFQUFFLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFO2FBQzdDO1lBYUQscUJBQXFCO1lBQ3JCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLEtBQUssYUFBYTt3QkFDakIsb0JBQUksQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTTs0QkFDbEQsaUNBQWlDOzRCQUNqQyxrQ0FBa0M7NEJBQ2xDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUNuQixlQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQ0FDN0IsT0FBTyxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDO2dDQUNuQixNQUFNLENBQUM7NEJBQ1IsQ0FBQzs0QkFDRCwyQkFBMkI7NEJBQzNCLElBQU0sS0FBSyxHQUFxQyxFQUFFLENBQUM7NEJBQ25ELElBQU0sS0FBSyxHQUFHLDhCQUE4QixDQUFDOzRCQUM3QyxJQUFJLE1BQXVCLENBQUM7NEJBRTVCLE9BQU8sSUFBSSxFQUFFLENBQUM7Z0NBQ2IsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQzVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29DQUFDLEtBQUssQ0FBQztnQ0FDdEMsSUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dDQUNuRCxlQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQ0FDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDbEIsQ0FBQzs0QkFDRCxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO3dCQUN6QyxDQUFDLENBQUMsQ0FBQzt3QkFDSCxNQUFNLGdCQUFDO29CQUNSO3dCQUNDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO3dCQUNuRCxNQUFNLGdCQUFDO2dCQUNULENBQUM7WUFDRixDQUFDOzs7U0FDRDtDQUVELENBQW9CLENBQUM7QUFFdEIsNEJBQTRCO0FBRTVCLHdCQUF3QixJQUFZO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsZ0JBQWdCO0lBQ2hCLEdBQUcsQ0FBQyxDQUFlLFVBQXVCLEVBQXZCLE1BQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQXZCLGNBQXVCLEVBQXZCLElBQXVCO1FBQXJDLElBQU0sSUFBSSxTQUFBO1FBQ2QsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsZ0JBQWdCO0lBQ2hCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQixZQUFZO0lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBRUQsb0JBQTBCLFVBQTBCOztZQXdCN0MsUUFBUSxFQUdWLE1BQU0sd0JBQ0MsQ0FBQyxFQWVMLE9BQU8sYUF1RVIsTUFBTSxVQUVELE9BQU8sRUFFWCxVQUFVOzs7O29CQXBIakIsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQzt3QkFBQyxNQUFNLGdCQUFDO29CQUUvQixlQUFDLENBQUMsR0FBRyxDQUFDLDJCQUF5QixVQUFVLENBQUMsT0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUM5RCxlQUFDLENBQUMsR0FBRyxDQUFDLDJCQUF3QixVQUFVLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUMzRSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLGVBQUMsQ0FBQyxHQUFHLENBQUMseUJBQXNCLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNyRixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDOzRCQUNsRCxlQUFDLENBQUMsR0FBRyxDQUFDLHFCQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQzNGLENBQUM7b0JBQ0YsQ0FBQztvQkFFRCwrREFBK0Q7b0JBQy9ELEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDO3dCQUFDLE1BQU0sZ0JBQUM7b0JBQzdDLHVEQUF1RDtvQkFDdkQsMENBQTBDO29CQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUI7d0JBQ2hDLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FDakcsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsTUFBTSxnQkFBQztvQkFDUixDQUFDOytCQUVnQixVQUFVLENBQUMsT0FBTztvQkFJbkMsR0FBRyxDQUFDLDRDQUFZLDRCQUFjLEVBQWQsSUFBYzs7d0JBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM5QixlQUFDLENBQUMsR0FBRyxDQUFDLFlBQVUsQ0FBQyxDQUFDLElBQUkscUJBQWdCLFFBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQzs0QkFDM0QsTUFBTSxHQUFHLENBQUMsQ0FBQzs0QkFDWCxLQUFLLENBQUM7d0JBQ1AsQ0FBQztxQkFDRDtvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2IsZUFBQyxDQUFDLEdBQUcsQ0FBQyw2Q0FBMkMsVUFBVSxDQUFDLEVBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDMUUsTUFBTSxnQkFBQztvQkFDUixDQUFDO3lCQUdHLENBQUEsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSxFQUFyQyx3QkFBcUM7b0JBQ3hDLGVBQUMsQ0FBQyxHQUFHLENBQUMsd0JBQXNCLFFBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQzs4QkFDakMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUM7b0JBRWhELDJCQUEyQjtvQkFDM0IscUJBQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7NEJBQ2xDLElBQUksRUFBRSxRQUFROzRCQUNkLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUNwQjtnQ0FDQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTOzZCQUN4QyxFQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FDM0I7NEJBQ0QsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQ3BCO2dDQUNDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtnQ0FDakIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPO2dDQUMzQixXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7Z0NBQ25DLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVzs2QkFDbkMsRUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQzNCO3lCQUNELENBQUMsRUFBQTs7b0JBbEJGLDJCQUEyQjtvQkFDM0IsU0FpQkUsQ0FBQzt5QkFFQyxDQUFBLE9BQU8sQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQSxFQUF2RCx3QkFBdUQ7b0JBQzFELHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2hCLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQzs0QkFDdEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFO2dDQUNoRCxJQUFJLEVBQUUsU0FBUztnQ0FDZixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Z0NBQ2hCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUU7NkJBQ3RCLENBQUMsQ0FBQzt3QkFDSixDQUFDLENBQUMsQ0FDRixFQUFBOztvQkFSRCxTQVFDLENBQUM7OztnQkFFSCwyQkFBMkI7Z0JBQzNCLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQ2hCLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQzt3QkFDcEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFOzRCQUNoRCxJQUFJLEVBQUUsT0FBTzs0QkFDYixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07NEJBQ2hCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUU7eUJBQ3RCLENBQUMsQ0FBQztvQkFDSixDQUFDLENBQUMsQ0FDRixFQUFBOztvQkFURCwyQkFBMkI7b0JBQzNCLFNBUUMsQ0FBQztvQkFDRix3Q0FBd0M7b0JBQ3hDLHFCQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUksUUFBUSxVQUFPLEVBQUU7NEJBQzVDLElBQUksRUFBRSxRQUFROzRCQUNkLE1BQU0sRUFBRTtnQ0FDUCxJQUFJLEVBQUUsV0FBVztnQ0FDakIsSUFBSSxFQUFFLHdCQUF3QjtnQ0FDOUIsSUFBSSxFQUFFLCtCQUErQjtnQ0FDckMsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLElBQUk7Z0NBQ1YsS0FBSyxFQUFFLEtBQUs7NkJBQ1o7NEJBQ0QsTUFBTSxFQUFFLEVBQUU7eUJBQ1YsQ0FBQyxFQUFBOztvQkFaRix3Q0FBd0M7b0JBQ3hDLFNBV0UsQ0FBQztvQkFFSCxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzt3QkFHWCxxQkFBTSxPQUFPLENBQUMsU0FBUyxDQUFJLFFBQVEsVUFBTyxDQUFDLEVBQUE7O2dDQUEzQyxTQUEyQzt5QkFFNUQsQ0FBQSxTQUFTLElBQUksSUFBSTt3QkFDakIsQ0FBQyxTQUFTLENBQUMsR0FBRyxLQUFLLFVBQVUsQ0FBQyxJQUFJOzRCQUNsQyxTQUFTLENBQUMsRUFBRSxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBLENBQUMsaUNBQWlDO3NCQUZqRix3QkFFK0MsQ0FBQyxpQ0FBaUM7b0JBRWpGLGVBQUMsQ0FBQyxHQUFHLENBQUMsNkJBQTJCLFFBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdEQscUJBQU0sT0FBTyxDQUFDLFNBQVMsQ0FBSSxRQUFRLFVBQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFBOztvQkFBbEUsU0FBa0UsQ0FBQzs7OzZCQUlyRCxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztvQkFDM0MsZUFBQyxDQUFDLEdBQUcsQ0FBSSxRQUFRLHVCQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lDQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU07Ozt5QkFBbEIsQ0FBQSxjQUFtQixDQUFBOztpQ0FFbEIsT0FBTyxDQUFDLFNBQVMsU0FBSSxRQUFRLFNBQUksT0FBUztvQkFDNUQscUJBQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBQTs7eUJBQXBDLENBQUEsQ0FBQSxTQUFvQyxLQUFJLElBQUksQ0FBQSxFQUE1Qyx5QkFBNEM7b0JBQy9DLGVBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQWlCLFVBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDOUMscUJBQU0sT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUE7O29CQUFqRSxTQUFpRSxDQUFDOzs7b0JBRWxFLGVBQUMsQ0FBQyxHQUFHLENBQUMsb0JBQWtCLFVBQVksRUFBRSxPQUFPLENBQUMsQ0FBQzs7O29CQVAzQixJQUFtQixDQUFBOzs7Ozs7Q0FVekM7QUFFRCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDdkI7SUFDQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDdkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDaEQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDakMsZUFBQyxDQUFDLEdBQUcsQ0FBQyxnQ0FBOEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUcsQ0FBQyxDQUFDO0lBQ2hFLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDbkIsQ0FBQztBQUNEO0lBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDeEIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLGVBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdkIsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3JCLE9BQU8sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELFVBQVUsR0FBRyxLQUFLLENBQUM7QUFDcEIsQ0FBQztBQUVELDZCQUE2QjtBQUM3QixPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFVBQUEsQ0FBQztJQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RCxDQUFDLENBQUMsQ0FBQztBQUNILE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBQSxHQUFHO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQyxDQUFDLENBQUMifQ==