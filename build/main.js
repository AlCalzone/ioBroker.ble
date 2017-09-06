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
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
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
                    knownDevices = _b.apply(_a, [_c.sent()]);
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
                    stateID = deviceID + "." + uuid;
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
                        data = void 0;
                        if (entry.data.type === "Buffer") {
                            data = Buffer.from(entry.data.data);
                        }
                        else {
                            global_1.Global.log("data type not supported: " + entry.data.type, { severity: global_1.Global.severity.warn });
                            continue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJkOi9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkE4TUE7O0FBOU1BLHVDQUE0RDtBQUM1RCw2QkFBK0I7QUFDL0IscUNBQWdDO0FBRWhDLHFDQUFxQztBQUNyQyxJQUFJLFlBQVksR0FBYSxFQUFFLENBQUM7QUFDaEMsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO0FBRTVCLDJCQUEyQjtBQUMzQixJQUFJLE9BQU8sR0FBb0IsZUFBSyxDQUFDLE9BQU8sQ0FBQztJQUM1QyxJQUFJLEVBQUUsS0FBSztJQUVYLDZFQUE2RTtJQUM3RSxjQUFjO0lBQ2QsS0FBSyxFQUFFOzs7OztvQkFFTixnQ0FBZ0M7b0JBQ2hDLE9BQU8sR0FBRyxlQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM1QixlQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztvQkFFcEIsMERBQTBEO29CQUMxRCxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRO3lCQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDO3lCQUNWLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQzt5QkFDM0IsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxJQUFJLElBQUksRUFBVCxDQUFTLENBQUMsQ0FDdEI7b0JBRUYsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDN0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUdmLEtBQUEsQ0FBQSxLQUFBLE1BQU0sQ0FBQSxDQUFDLElBQUksQ0FBQTtvQkFDekIscUJBQU0sZUFBQyxDQUFDLEVBQUUsQ0FBSSxPQUFPLENBQUMsU0FBUyxPQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUE7O29CQUYvQyx5QkFBeUI7b0JBQ3pCLFlBQVksR0FBRyxjQUNkLFNBQThDLEVBQzlDLENBQUM7b0JBRUYsK0JBQStCO29CQUMvQixLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFDLEtBQUs7d0JBQzdCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ2YsS0FBSyxXQUFXO2dDQUNmLGFBQWEsRUFBRSxDQUFDO2dDQUNoQixLQUFLLENBQUM7NEJBQ1AsS0FBSyxZQUFZO2dDQUNoQixZQUFZLEVBQUUsQ0FBQztnQ0FDZixLQUFLLENBQUM7d0JBQ1IsQ0FBQzt3QkFDRCxPQUFPLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUM7d0JBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ2pELE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7OztTQUN4RDtJQUVELHlGQUF5RjtJQUN6RixNQUFNLEVBQUUsVUFBQyxRQUFRO1FBQ2hCLElBQUksQ0FBQztZQUNKLFlBQVksRUFBRSxDQUFDO1lBQ2YsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3hDLFFBQVEsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDWixRQUFRLEVBQUUsQ0FBQztRQUNaLENBQUM7SUFDRixDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLFlBQVksRUFBRSxVQUFDLEVBQUUsRUFBRSxHQUFHO0lBRXRCLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsV0FBVyxFQUFFLFVBQUMsRUFBRSxFQUFFLEtBQUs7SUFFdkIsQ0FBQztDQWVELENBQW9CLENBQUM7QUFFdEIsNEJBQTRCO0FBRTVCLHdCQUF3QixJQUFZO0lBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7UUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzVCLGdCQUFnQjtJQUNoQixHQUFHLENBQUMsQ0FBZSxVQUF1QixFQUF2QixNQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUF2QixjQUF1QixFQUF2QixJQUF1QjtRQUFyQyxJQUFNLElBQUksU0FBQTtRQUNkLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM5QjtJQUNELGdCQUFnQjtJQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0IsWUFBWTtJQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsNkJBQW1DLFFBQWdCLEVBQUUsSUFBWSxFQUFFLEtBQVUsRUFBRSxHQUFZOzs7Ozs7b0JBRXBGLE9BQU8sR0FBTSxRQUFRLFNBQUksSUFBTSxDQUFDO29CQUN4QixxQkFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFBOztvQkFBeEMsS0FBSyxHQUFHLFNBQWdDO3lCQUMxQyxDQUFBLEtBQUssSUFBSSxJQUFJLENBQUEsRUFBYix3QkFBYTtvQkFDaEIscUJBQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTs0QkFDdEQsTUFBTSxFQUFFLE9BQU87NEJBQ2YsTUFBTSxFQUFFLHFCQUFxQixHQUFHLElBQUk7NEJBQ3BDLE1BQU0sRUFBRSxFQUFFOzRCQUNWLE1BQU0sRUFBRSxPQUFPOzRCQUNmLE1BQU0sRUFBRSxJQUFJOzRCQUNaLE9BQU8sRUFBRSxLQUFLOzRCQUNkLEtBQUssRUFBRSxLQUFLO3lCQUNaLENBQUMsRUFBQTs7b0JBUkYsU0FRRSxDQUFDOzt3QkFFSCxxQkFBTSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBQTs7b0JBQW5ELFNBQW1ELENBQUM7Ozs7OztDQUVyRDtBQUVELG9CQUEwQixVQUEwQjs7Ozs7O29CQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxhQUFhLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFBQyxNQUFNLGdCQUFDO29CQUV4RixVQUFVLEdBQVcsVUFBVSxDQUFDLE9BQU8sQ0FBQzt5QkFFMUMsQ0FBQSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBLEVBQXZDLHdCQUF1QztvQkFDMUMsOEJBQThCO29CQUM5QixxQkFBTSxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRTs0QkFDdkMsU0FBUzs0QkFDVCxJQUFJLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxTQUFTO3lCQUN4QyxFQUFFOzRCQUNGLFNBQVM7NEJBQ1QsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFFOzRCQUNqQixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87NEJBQzNCLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVzs0QkFDbkMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO3lCQUNuQyxDQUFDLEVBQUE7O29CQVZGLDhCQUE4QjtvQkFDOUIsU0FTRSxDQUFDO29CQUNILHVDQUF1QztvQkFDdkMscUJBQU0sT0FBTyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFOzRCQUNwRCxTQUFTOzRCQUNULElBQUksRUFBRSxxQkFBcUI7NEJBQzNCLElBQUksRUFBRSxNQUFNO3lCQUNaLENBQUMsRUFBQTs7b0JBTEYsdUNBQXVDO29CQUN2QyxTQUlFLENBQUM7b0JBQ0gsbUNBQW1DO29CQUNuQyxnRUFBZ0U7b0JBQ2hFLGFBQWE7b0JBQ2IsNEJBQTRCO29CQUM1QixnQkFBZ0I7b0JBQ2hCLE1BQU07b0JBQ04scUJBQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTs0QkFDcEQsTUFBTSxFQUFFLFdBQVc7NEJBQ25CLE1BQU0sRUFBRSx3QkFBd0I7NEJBQ2hDLE1BQU0sRUFBRSwrQkFBK0I7NEJBQ3ZDLE1BQU0sRUFBRSxRQUFROzRCQUNoQixNQUFNLEVBQUUsSUFBSTs0QkFDWixPQUFPLEVBQUUsS0FBSzt5QkFDZCxDQUFDLEVBQUE7O29CQWJGLG1DQUFtQztvQkFDbkMsZ0VBQWdFO29CQUNoRSxhQUFhO29CQUNiLDRCQUE0QjtvQkFDNUIsZ0JBQWdCO29CQUNoQixNQUFNO29CQUNOLFNBT0UsQ0FBQzs7O2dCQUVKLDBCQUEwQjtnQkFDMUIscUJBQU0sT0FBTyxDQUFDLGdCQUFnQixDQUFJLFVBQVUsVUFBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUE7O29CQUQzRSwwQkFBMEI7b0JBQzFCLFNBQTJFLENBQUM7b0JBQzVFLDZCQUE2QjtvQkFDN0IsR0FBRyxDQUFDLE9BQW9ELEVBQXBDLEtBQUEsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQXBDLGNBQW9DLEVBQXBDLElBQW9DO3dCQUE3QyxLQUFLO3dCQUNULElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO3dCQUVwQixJQUFJLFNBQTBCLENBQUM7d0JBQ25DLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQ2xDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3JDLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ1AsZUFBQyxDQUFDLEdBQUcsQ0FBQyw4QkFBNEIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsZUFBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDOzRCQUNsRixRQUFRLENBQUM7d0JBQ1YsQ0FBQzt3QkFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZCLGNBQWM7NEJBQ2QsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUM7NEJBQ25DLG1CQUFtQjs0QkFDbkIsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzdCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ1AsUUFBUSxDQUFDO3dCQUNWLENBQUM7d0JBQ0QsZUFBZTt3QkFDZixtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDbEQ7Ozs7O0NBQ0Q7QUFBQSxDQUFDO0FBRUYsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCO0lBQ0MsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDO1FBQUMsTUFBTSxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hELEtBQUssQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2pDLEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDbkIsQ0FBQztBQUNEO0lBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7UUFBQyxNQUFNLENBQUM7SUFDeEIsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUNyQixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRCxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLENBQUMifQ==