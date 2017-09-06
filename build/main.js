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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
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
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Adapter-Instanz global machen
                    adapter = global_1.Global.extend(adapter);
                    global_1.Global.adapter = adapter;
                    // Bring the monitored service names into the correct form
                    services = adapter.config.services
                        .split(",")
                        .map(function (s) { return fixServiceName(s); })
                        .filter(function (s) { return s != null; });
                    adapter.subscribeStates("*");
                    adapter.subscribeObjects("*");
                    _b = (_a = Object).keys;
                    return [4 /*yield*/, global_1.Global.$$(adapter.namespace + ".*", "device")];
                case 1:
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
/**
 * Update or create the stored service data for a given device and UUID
 * @param stateId ID of the state to update or create
 * @param uuid GATT UUID of the advertised service data
 * @param value The value to store
 */
function updateAdvertisement(deviceID, uuid, value, ack) {
    return __awaiter(this, void 0, void 0, function () {
        var stateID, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stateID = deviceID + ".services." + uuid;
                    return [4 /*yield*/, adapter.$getState(stateID)];
                case 1:
                    state = _a.sent();
                    if (!(state == null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, adapter.$createState(deviceID, "services", uuid, {
                            "role": "value",
                            "name": "Advertised service " + uuid,
                            "desc": "",
                            "type": "mixed",
                            "read": true,
                            "write": false,
                            "def": value
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, adapter.$setStateChanged(stateID, value, ack)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function onDiscover(peripheral) {
    return __awaiter(this, void 0, void 0, function () {
        var deviceName, _i, _a, entry, uuid, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData))
                        return [2 /*return*/];
                    deviceName = peripheral.address;
                    if (!(knownDevices.indexOf(deviceName) === -1)) return [3 /*break*/, 4];
                    // need to create device first
                    return [4 /*yield*/, adapter.$createDevice(deviceName, {
                            // common
                            name: peripheral.advertisement.localName,
                        }, {
                            // native
                            id: peripheral.id,
                            address: peripheral.address,
                            addressType: peripheral.addressType,
                            connectable: peripheral.connectable
                        })];
                case 1:
                    // need to create device first
                    _b.sent();
                    // also create channels for information
                    return [4 /*yield*/, adapter.$createChannel(deviceName, "services", {
                            // common
                            name: "Advertised services",
                            role: "info"
                        })];
                case 2:
                    // also create channels for information
                    _b.sent();
                    // TODO: Enable this when supported
                    // await adapter.$createChannel(deviceName, "characteristics", {
                    // 	// common
                    // 	name: "Characteristics",
                    // 	role: "info"
                    // });
                    return [4 /*yield*/, adapter.$createState(deviceName, null, "rssi", {
                            "role": "indicator",
                            "name": "signal strength (RSSI)",
                            "desc": "Signal strength of the device",
                            "type": "number",
                            "read": true,
                            "write": false
                        })];
                case 3:
                    // TODO: Enable this when supported
                    // await adapter.$createChannel(deviceName, "characteristics", {
                    // 	// common
                    // 	name: "Characteristics",
                    // 	role: "info"
                    // });
                    _b.sent();
                    knownDevices.push(deviceName);
                    _b.label = 4;
                case 4: 
                // update RSSI information
                return [4 /*yield*/, adapter.$setStateChanged(deviceName + ".rssi", peripheral.rssi, true)];
                case 5:
                    // update RSSI information
                    _b.sent();
                    // update service information
                    for (_i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
                        entry = _a[_i];
                        uuid = entry.uuid;
                        data = entry.data;
                        if (data.length === 1) {
                            // single byte
                            data = data[0];
                        }
                        else if (data instanceof Buffer) {
                            // Output hex value
                            data = data.toString("hex");
                        }
                        else {
                            continue;
                        }
                        // and store it
                        updateAdvertisement(deviceName, uuid, data, true);
                    }
                    return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQXVRRzs7QUF2UUgsdUNBQTREO0FBQzVELHFDQUFnQztBQUNoQywrQ0FBcUM7QUFFckMscUNBQXFDO0FBQ3JDLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztBQUNoQyxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7QUFFNUIsd0JBQXdCO0FBQ3hCLElBQUksS0FBSyxDQUFDO0FBRVYsMkJBQTJCO0FBQzNCLElBQUksT0FBTyxHQUFvQixlQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVDLElBQUksRUFBRSxLQUFLO0lBRVgsNkVBQTZFO0lBQzdFLGNBQWM7SUFDZCxLQUFLLEVBQUU7Ozs7O29CQUVOLGdDQUFnQztvQkFDaEMsT0FBTyxHQUFHLGVBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzVCLGVBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO29CQUVwQiwwREFBMEQ7b0JBQzFELFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7eUJBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUM7eUJBQ1YsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDO3lCQUMzQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksSUFBSSxFQUFULENBQVMsQ0FBQyxDQUN0QjtvQkFFRixPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JB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