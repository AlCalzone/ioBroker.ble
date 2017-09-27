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
var fs = require("fs");
var path = require("path");
var object_polyfill_1 = require("./object-polyfill");
var promises_1 = require("./promises");
// ==================================
var colors = {
    red: "#db3340",
    yellow: "#ffa200",
    green: "#5bb12f",
    blue: "#0087cb",
};
var replacements = {
    bold: [/\*{2}(.*?)\*{2}/g, "<b>$1</b>"],
    italic: [/#{2}(.*?)#{2}/g, "<i>$1</i>"],
    underline: [/_{2}(.*?)_{2}/g, "<u>$1</u>"],
    strikethrough: [/\~{2}(.*?)\~{2}/g, "<s>$1</s>"],
    color: [/\{{2}(\w+)\|(.*?)\}{2}/, function (str, p1, p2) {
            var color = colors[p1];
            if (!color)
                return str;
            return "<span style=\"color: " + color + "\">" + p2 + "</span>";
        }],
    fullcolor: [/^\{{2}(\w+)\}{2}(.*?)$/, function (str, p1, p2) {
            var color = colors[p1];
            if (!color)
                return str;
            return "<span style=\"color: " + color + "\">" + p2 + "</span>";
        }],
};
var Global = /** @class */ (function () {
    function Global() {
    }
    Object.defineProperty(Global, "adapter", {
        get: function () { return Global._adapter; },
        set: function (adapter) {
            Global._adapter = adapter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Global, "loglevel", {
        get: function () { return Global._loglevel; },
        set: function (value) { Global._loglevel = value; },
        enumerable: true,
        configurable: true
    });
    Global.extend = function (adapter) {
        // Eine Handvoll Funktionen promisifizieren
        var _this = this;
        var ret = adapter;
        if (!ret.__isExtended) {
            ret = Object.assign(ret, {
                $getObject: promises_1.promisify(adapter.getObject, adapter),
                $setObject: promises_1.promisify(adapter.setObject, adapter),
                $setObjectNotExists: promises_1.promisify(adapter.setObjectNotExists, adapter),
                $extendObject: promises_1.promisify(adapter.extendObject, adapter),
                $getAdapterObjects: promises_1.promisify(adapter.getAdapterObjects, adapter),
                $getForeignObject: promises_1.promisify(adapter.getForeignObject, adapter),
                $setForeignObject: promises_1.promisify(adapter.setForeignObject, adapter),
                $setForeignObjectNotExists: promises_1.promisify(adapter.setForeignObjectNotExists, adapter),
                $extendForeignObject: promises_1.promisify(adapter.extendForeignObject, adapter),
                $getForeignObjects: promises_1.promisify(adapter.getForeignObjects, adapter),
                $createDevice: promises_1.promisify(adapter.createDevice, adapter),
                $deleteDevice: promises_1.promisify(adapter.deleteDevice, adapter),
                $createChannel: promises_1.promisify(adapter.createChannel, adapter),
                $deleteChannel: promises_1.promisify(adapter.deleteChannel, adapter),
                $getState: promises_1.promisify(adapter.getState, adapter),
                $getStates: promises_1.promisify(adapter.getStates, adapter),
                $setState: promises_1.promisify(adapter.setState, adapter),
                $setStateChanged: promises_1.promisify(adapter.setStateChanged, adapter),
                $createState: promises_1.promisify(adapter.createState, adapter),
                $deleteState: promises_1.promisify(adapter.deleteState, adapter),
                $getForeignState: promises_1.promisify(adapter.getForeignState, adapter),
                $setForeignState: promises_1.promisify(adapter.setForeignState, adapter),
                $sendTo: promises_1.promisifyNoError(adapter.sendTo, adapter),
            });
        }
        ret.$createOwnState = function (id, initialValue, ack, commonType) {
            if (ack === void 0) { ack = true; }
            if (commonType === void 0) { commonType = "mixed"; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ret.$setObject(id, {
                                type: "state",
                                common: {
                                    name: id,
                                    role: "value",
                                    type: commonType,
                                    read: true,
                                    write: true,
                                },
                                native: {},
                            })];
                        case 1:
                            _a.sent();
                            if (!(initialValue != undefined)) return [3 /*break*/, 3];
                            return [4 /*yield*/, ret.$setState(id, initialValue, ack)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ret.$createOwnStateEx = function (id, obj, initialValue, ack) {
            if (ack === void 0) { ack = true; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, ret.$setObject(id, obj)];
                        case 1:
                            _a.sent();
                            if (!(initialValue != undefined)) return [3 /*break*/, 3];
                            return [4 /*yield*/, ret.$setState(id, initialValue, ack)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return ret;
    };
    /*
        Formatierungen:
        **fett**, ##kursiv##, __unterstrichen__, ~~durchgestrichen~~
        schwarz{{farbe|bunt}}schwarz, {{farbe}}bunt
    */
    Global.log = function (message, level) {
        if (level === void 0) { level = "info"; }
        if (!Global.adapter)
            return;
        if (message) {
            // Farben und Formatierungen
            for (var _i = 0, _a = object_polyfill_1.entries(replacements); _i < _a.length; _i++) {
                var _b = _a[_i], _c = _b[1], regex = _c[0], repl = _c[1];
                if (typeof repl === "string") {
                    message = message.replace(regex, repl);
                }
                else {
                    message = message.replace(regex, repl);
                }
            }
        }
        Global._adapter.log[level](message);
    };
    /**
     * Kurzschreibweise für die Ermittlung eines Objekts
     * @param id
     */
    Global.$ = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Global._adapter.$getForeignObject(id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Kurzschreibweise für die Ermittlung mehrerer Objekte
     * @param id
     */
    Global.$$ = function (pattern, type, role) {
        return __awaiter(this, void 0, void 0, function () {
            var objects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Global._adapter.$getForeignObjects(pattern, type)];
                    case 1:
                        objects = _a.sent();
                        if (role) {
                            return [2 /*return*/, object_polyfill_1.filter(objects, function (o) { return o.common.role === role; })];
                        }
                        else {
                            return [2 /*return*/, objects];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // Prüfen auf (un)defined
    Global.isdef = function (value) { return value != undefined; };
    // Workaround für unvollständige Adapter-Upgrades
    Global.ensureInstanceObjects = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ioPack, setObjects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ioPack = JSON.parse(fs.readFileSync(path.join(__dirname, "../../io-package.json"), "utf8"));
                        if (ioPack.instanceObjects == null || ioPack.instanceObjects.length === 0)
                            return [2 /*return*/];
                        setObjects = ioPack.instanceObjects.map(function (obj) { return Global._adapter.$setObjectNotExists(obj._id, obj); });
                        return [4 /*yield*/, Promise.all(setObjects)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Global.loglevels = Object.freeze({ off: 0, on: 1, ridiculous: 2 });
    Global.severity = Object.freeze({ normal: 0, warn: 1, error: 2 });
    Global._loglevel = Global.loglevels.on;
    return Global;
}());
exports.Global = Global;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLmpzIiwic291cmNlUm9vdCI6ImQ6L2lvQnJva2VyLmJsZS9zcmMvIiwic291cmNlcyI6WyJsaWIvZ2xvYmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1QkFBeUI7QUFDekIsMkJBQTZCO0FBQzdCLHFEQUFpRjtBQUNqRix1Q0FBeUQ7QUFFekQscUNBQXFDO0FBRXJDLElBQU0sTUFBTSxHQUFHO0lBQ2QsR0FBRyxFQUFFLFNBQVM7SUFDZCxNQUFNLEVBQUUsU0FBUztJQUNqQixLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsU0FBUztDQUNmLENBQUM7QUFFRixJQUFNLFlBQVksR0FFZDtJQUNILElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQztJQUN2QyxNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUM7SUFDdkMsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO0lBQzFDLGFBQWEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQztJQUNoRCxLQUFLLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUM3QyxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUV2QixNQUFNLENBQUMsMEJBQXVCLEtBQUssV0FBSyxFQUFFLFlBQVMsQ0FBQztRQUNyRCxDQUFDLENBQUM7SUFDRixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUNqRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENB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