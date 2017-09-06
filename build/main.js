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
var noble = require("noble");
var utils_1 = require("./lib/utils");
/** MAC addresses of known devices */
var knownDevices = [];
var services = [];
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
    },
    // is called if a subscribed state changes
    stateChange: function (id, state) {
    },
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
;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQW1ORzs7QUFuTkgsdUNBQTREO0FBQzVELDZCQUErQjtBQUMvQixxQ0FBZ0M7QUFFaEMscUNBQXFDO0FBQ3JDLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztBQUNoQyxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7QUFFNUIsMkJBQTJCO0FBQzNCLElBQUksT0FBTyxHQUFvQixlQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVDLElBQUksRUFBRSxLQUFLO0lBRVgsNkVBQTZFO0lBQzdFLGNBQWM7SUFDZCxLQUFLLEVBQUU7Ozs7O29CQUVOLGdDQUFnQztvQkFDaEMsT0FBTyxHQUFHLGVBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzVCLGVBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO29CQUVwQiwwREFBMEQ7b0JBQzFELFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7eUJBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUM7eUJBQ1YsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDO3lCQUMzQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksSUFBSSxFQUFULENBQVMsQ0FBQyxDQUN0QjtvQkFFRixPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBR2YsS0FBQSxDQUFBLEtBQUEsTUFBTSxDQUFBLENBQUMs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