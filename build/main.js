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
                        .map(function (p) { return p.trim().toLowerCase(); })
                        .concat("_default");
                    enabledPlugins = plugins_1.default.filter(function (p) { return enabledPluginNames.indexOf(p.name.toLowerCase()) > -1; });
                    global_1.Global.log("enabled plugins: " + enabledPlugins.map(function (p) { return p.name; }).join(", "));
                    allServices = (_c = adapter.config.services.split(",")) // get manually defined services
                    .concat.apply(_c, plugins_1.default.map(function (p) { return p.advertisedServices; })).reduce(function (acc, s) { return acc.concat(s); }, []) // flatten the arrays
                        .map(function (s) { return fixServiceName(s); }) // cleanup the names
                        .filter(function (s) { return s != null && s != ""; })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQThTRzs7QUE5U0gsdUNBQTREO0FBQzVELHFDQUFnQztBQUNoQywrQ0FBcUM7QUFJckMscUNBQWdDO0FBQ2hDLElBQUksY0FBd0IsQ0FBQztBQUU3QixxQ0FBcUM7QUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0FBQ2hDLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUU1Qix3QkFBd0I7QUFDeEIsSUFBSSxLQUFLLENBQUM7QUFFViwyQkFBMkI7QUFDM0IsSUFBSSxPQUFPLEdBQW9CLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUMsSUFBSSxFQUFFLEtBQUs7SUFFWCw2RUFBNkU7SUFDN0UsY0FBYztJQUNkLEtBQUssRUFBRTtZQVdBLGtCQUFrQixFQVNsQixXQUFXOzs7O29CQWxCakIsZ0NBQWdDO29CQUNoQyxPQUFPLEdBQUcsZUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUIsZUFBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBRXBCLHNEQUFzRDtvQkFDdEQscUJBQU0sZUFBQyxDQUFDLHFCQUFxQixFQUFFLEVBQUE7O29CQUQvQixzREFBc0Q7b0JBQ3RELFNBQStCLENBQUM7b0JBRWhDLGdCQUFnQjtvQkFDaEIsZUFBQyxDQUFDLEdBQUcsQ0FBQyxxQkFBbUIsaUJBQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO3lDQUMzQixDQUFDLE9BQU8s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