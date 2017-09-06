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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJDOi9Vc2Vycy9Eb21pbmljL0RvY3VtZW50cy9WaXN1YWwgU3R1ZGlvIDIwMTcvUmVwb3NpdG9yaWVzL2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlCQXFORzs7QUFyTkgsdUNBQTREO0FBQzVELHFDQUFnQztBQUVoQyxxQ0FBcUM7QUFDckMsSUFBSSxZQUFZLEdBQWEsRUFBRSxDQUFDO0FBQ2hDLElBQUksUUFBUSxHQUFhLEVBQUUsQ0FBQztBQUU1Qix3QkFBd0I7QUFDeEIsSUFBSSxLQUFLLENBQUM7QUFFViwyQkFBMkI7QUFDM0IsSUFBSSxPQUFPLEdBQW9CLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDNUMsSUFBSSxFQUFFLEtBQUs7SUFFWCw2RUFBNkU7SUFDN0UsY0FBYztJQUNkLEtBQUssRUFBRTs7Ozs7b0JBRU4sZ0NBQWdDO29CQUNoQyxPQUFPLEdBQUcsZUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUIsZUFBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7b0JBRXBCLDBEQUEwRDtvQkFDMUQsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUTt5QkFDaEMsS0FBSyxDQUFDLEdBQUcsQ0FBQzt5QkFDVixHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQWpCLENBQWlCLENBQUM7eUJBQzNCLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsSUFBSSxJQUFJLEVBQVQsQ0FBUyxDQUFDLENBQ3RCO29CQUVGLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzdCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFHZixLQUFBLENBQUEs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