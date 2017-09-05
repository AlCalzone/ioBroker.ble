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
Object.defineProperty(exports, "__esModule", { value: true });
// you have to require the utils module and call adapter function
var noble = require("noble");
var utils_1 = require("./lib/utils");
var services = [];
var adapter = utils_1.default.adapter({
    name: "template-ts",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: function () {
        // TODO: Make extended adapter
        // Bring the monitored service names into the correct form
        services = adapter.config.services
            .split(",")
            .map(function (s) { return fixServiceName(s); })
            .filter(function (s) { return s != null; });
        adapter.subscribeStates("*");
        adapter.subscribeObjects("*");
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
        });
        if (noble.state === "poweredOn")
            startScanning();
    },
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
        // Warning, obj can be null if it was deleted
        adapter.log.info("objectChange " + id + " " + JSON.stringify(obj));
    },
    // is called if a subscribed state changes
    stateChange: function (id, state) {
        // Warning, state can be null if it was deleted
        adapter.log.info("stateChange " + id + " " + JSON.stringify(state));
        // you can use the ack flag to detect if it is status (true) or command (false)
        if (state && !state.ack) {
            adapter.log.info("ack is not set!");
        }
    },
    // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
    // requires the property to be configured in io-package.json
    message: function (obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                // e.g. send email or pushover or whatever
                console.log("send command");
                // Send response in callback if required
                if (obj.callback)
                    adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
        }
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
function updateState(stateId, value, ack) {
    return __awaiter(this, void 0, void 0, function () {
        var val;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, adapter.$getState(stateId)];
                case 1:
                    val = (_a.sent()).val;
                    if (!(val == null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, adapter.$createState(stateId, value)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, adapter.$setStateChanged(stateId, value, ack)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
var onDiscover = function (p) {
    // TODO: create better object structures
    if (!(p && p.advertisement && p.advertisement.serviceData))
        return;
    var stateId_name = "BLE." + p.address + ".name";
    createState("BLE." + p.address + ".name", p.advertisement.localName);
    for (var _i = 0, _a = p.advertisement.serviceData; _i < _a.length; _i++) {
        var entry = _a[_i];
        var uuid = entry.uuid;
        var data = entry.data;
        if (data.type === "Buffer") {
            data = Buffer.from(data.data);
        }
        if (data.length === 1) {
            // single byte
            data = data[0];
        }
        else {
            continue;
        }
        updateState("BLE." + p.address + "." + uuid, data, true);
    }
};
var isScanning = false;
function startScanning() {
    if (isScanning)
        return;
    noble.on("discover", onDiscover);
    noble.startScanning(services, true);
    isScanning = true;
}
function stopScanning() {
    if (!isScanning)
        return;
    noble.removeAllListeners("discover");
    noble.stopScanning();
    isScanning = false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJkOi9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQWlFO0FBQ2pFLDZCQUErQjtBQUMvQixxQ0FBZ0M7QUFFaEMsSUFBSSxRQUFRLEdBQWEsRUFBRSxDQUFDO0FBRTVCLElBQU0sT0FBTyxHQUFHLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDN0IsSUFBSSxFQUFFLGFBQWE7SUFFbkIsNkVBQTZFO0lBQzdFLGNBQWM7SUFDZCxLQUFLLEVBQUU7UUFFTiw4QkFBOEI7UUFFOUIsMERBQTBEO1FBQzFELFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7YUFDaEMsS0FBSyxDQUFDLEdBQUcsQ0FBQzthQUNWLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBakIsQ0FBaUIsQ0FBQzthQUMzQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLElBQUksSUFBSSxFQUFULENBQVMsQ0FBQyxDQUN0QjtRQUVGLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLCtCQUErQjtRQUMvQixLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFDLEtBQUs7WUFDN0IsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDZixLQUFLLFdBQVc7b0JBQ2YsYUFBYSxFQUFFLENBQUM7b0JBQ2hCLEtBQUssQ0FBQztnQkFDUCxLQUFLLFlBQVk7b0JBQ2hCLFlBQVksRUFBRSxDQUFDO29CQUNmLEtBQUssQ0FBQztZQUNSLENBQUM7UUFDRixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxDQUFDLEtBQUss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