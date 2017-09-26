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
var global_1 = require("./lib/global");
var utils_1 = require("./lib/utils");
var child_process_1 = require("child_process");
var plugins_1 = require("./plugins");
var enabledPlugins;
/** MAC addresses of known devices */
var knownDevices = [];
var services = [];
// noble-Treiber-Instanz
var noble;
// Adapter-Objekt erstellen
var adapter = utils_1.default.adapter({
    name: "ble",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: function () { return __awaiter(_this, void 0, void 0, function () {
        var enabledPluginNames, allServices, _a, _b, _c;
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
                        .map(function (p) { return p.trim(); });
                    enabledPlugins = plugins_1.default.filter(function (p) { return enabledPluginNames.indexOf(p.name); });
                    global_1.Global.log("enabled plugins: " + enabledPlugins.map(function (p) { return p.name; }).join(", "));
                    allServices = (_c = adapter.config.services.split(",")) // get manually defined services
                    .concat.apply(_c, plugins_1.default.map(function (p) { return p.advertisedServices; })).reduce(function (acc, s) { return acc.concat(s); }, []) // flatten the arrays
                        .map(function (s) { return fixServiceName(s); }) // cleanup the names
                        .filter(function (s) { return s != null; })
                        .reduce(function (acc, s) {
                        if (acc.indexOf(s) === -1)
                            acc.push(s);
                        return acc;
                    }, []);
                    global_1.Global.log("monitored services: " + allServices.join(", "));
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
            for (var i = 0; i < params.length; i++) {
                if (!(obj.message && obj.message.hasOwnProperty(params[i]))) {
                    respond(predefinedResponses.MISSING_PARAMETER(params[i]));
                    return false;
                }
            }
            return true;
        }
        var predefinedResponses;
        return __generator(this, function (_a) {
            predefinedResponses = {
                ACK: { error: null },
                OK: { error: null, result: 'ok' },
                ERROR_UNKNOWN_COMMAND: { error: 'Unknown command!' },
                MISSING_PARAMETER: function (paramName) {
                    return { error: 'missing parameter "' + paramName + '"!' };
                },
                COMMAND_RUNNING: { error: 'command running' }
            };
            // handle the message
            if (obj) {
                switch (obj.command) {
                    case "getHCIPorts":
                        child_process_1.exec("hciconfig | grep hci", function (error, stdout, stderr) {
                            //hci1:   Type: BR/EDR  Bus: USB
                            //hci0:   Type: BR/EDR  Bus: UART
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
                        else {
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
                                "role": "indicator",
                                "name": "signal strength (RSSI)",
                                "desc": "Signal strength of the device",
                                "type": "number",
                                "read": true,
                                "write": false
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQTZTRzs7QUE3U0gsdUNBQTREO0FBQzVELHFDQUFnQztBQUNoQywrQ0FBcUM7QUFJckMscUNBQWdDO0FBQ2hDLElBQUksY0FBd0IsQ0FBQztBQUU3QixxQ0FBcUM7QUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0FBQ2hDLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUU1Qix3QkFBd0I7QUFDeEIsSUFBSSxLQUFLLENBQUM7QUFFViwyQkFBMkI7QUFDM0IsSUFBSSxPQUFPLEdBQW9CLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUMsSUFBSSxFQUFFLEtBQUs7SUFFWCw2RUFBNkU7SUFDN0UsY0FBYztJQUNkLEtBQUssRUFBRTtZQVdBLGtCQUFrQixFQVFsQixXQUFXOzs7O29CQWpCakIsZ0NBQWdDO29CQUNoQyxPQUFPLEdBQUcsZUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUIsZUFBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBRXBCLHNEQUFzRDtvQkFDdEQscUJBQU0sZUFBQyxDQUFDLHFCQUFxQixFQUFFLEVBQUE7O29CQUQvQixzREFBc0Q7b0JBQ3RELFNBQStCLENBQUM7b0JBRWhDLGdCQUFnQjtvQkFDaEIsZUFBQyxDQUFDLEdBQUcsQ0FBQyxxQkFBbUIsaUJBQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO3lDQUMzQixDQUFDLE9BQU8s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