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
 * Update the state with the given ID or create it if it doesn't exist
 * @param stateId ID of the state to update or create
 * @param value The value to store
 */
function updateCharacteristic(deviceID, characteristic, value, ack) {
    return __awaiter(this, void 0, void 0, function () {
        var stateID, state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stateID = deviceID + "." + characteristic;
                    return [4 /*yield*/, adapter.$getState(stateID)];
                case 1:
                    state = _a.sent();
                    if (!(state == null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, adapter.$createState(deviceID, null, characteristic, {
                            "role": "value",
                            "name": "BLE characteristic " + characteristic,
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
        var _i, _a, entry, uuid, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData))
                        return [2 /*return*/];
                    if (!(knownDevices.indexOf(peripheral.address) === -1)) return [3 /*break*/, 2];
                    // need to create device first
                    return [4 /*yield*/, adapter.$createDevice(peripheral.address, {
                            name: peripheral.advertisement.localName,
                        })];
                case 1:
                    // need to create device first
                    _b.sent();
                    _b.label = 2;
                case 2:
                    for (_i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
                        entry = _a[_i];
                        uuid = entry.uuid;
                        data = entry.data;
                        if (data.type === "Buffer") {
                            data = Buffer.from(data.data);
                        }
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
                        updateCharacteristic(peripheral.address, uuid, data, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQXlLQTs7QUF6S0EsdUNBQTREO0FBQzVELDZCQUErQjtBQUMvQixxQ0FBZ0M7QUFFaEMscUNBQXFDO0FBQ3JDLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztBQUNoQyxJQUFJLFFBQVEsR0FBYSxFQUFFLENBQUM7QUFFNUIsMkJBQTJCO0FBQzNCLElBQUksT0FBTyxHQUFvQixlQUFLLENBQUMsT0FBTyxDQUFDO0lBQzVDLElBQUksRUFBRSxLQUFLO0lBRVgsNkVBQTZFO0lBQzdFLGNBQWM7SUFDZCxLQUFLLEVBQUU7Ozs7O29CQUVOLGdDQUFnQztvQkFDaEMsT0FBTyxHQUFHLGVBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzVCLGVBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO29CQUVwQiwwREFBMEQ7b0JBQzFELFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7eUJBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUM7eUJBQ1YsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDO3lCQUMzQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksSUFBSSxFQUFULENBQVMsQ0FBQyxDQUN0QjtvQkFFRixPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBR2YsS0FBQSxDQUFBLEtBQUEsTUFBTSxDQUFBLENBQUMs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