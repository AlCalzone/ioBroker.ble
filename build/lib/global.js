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
Object.defineProperty(exports, "__esModule", { value: true });
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
var Global = (function () {
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
            ret.objects.$getObjectList = promises_1.promisify(adapter.objects.getObjectList, adapter.objects);
            ret = Object.assign(ret, {
                $getObject: promises_1.promisify(adapter.getObject, adapter),
                $setObject: promises_1.promisify(adapter.setObject, adapter),
                $getAdapterObjects: promises_1.promisify(adapter.getAdapterObjects, adapter),
                $getForeignObject: promises_1.promisify(adapter.getForeignObject, adapter),
                $setForeignObject: promises_1.promisify(adapter.setForeignObject, adapter),
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
    Global.log = function (message, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.level, level = _c === void 0 ? Global.loglevels.on : _c, _d = _b.severity, severity = _d === void 0 ? Global.severity.normal : _d;
        if (!Global.adapter)
            return;
        if (level < Global._loglevel)
            return;
        // Warnstufe auswählen
        var logFn;
        switch (severity) {
            case Global.severity.warn:
                logFn = "warn";
                break;
            case Global.severity.error:
                logFn = "error";
                break;
            case Global.severity.normal:
            default:
                logFn = "info";
        }
        if (message) {
            // Farben und Formatierungen
            for (var _i = 0, _e = object_polyfill_1.entries(replacements); _i < _e.length; _i++) {
                var _f = _e[_i], _g = _f[1], regex = _g[0], repl = _g[1];
                if (typeof repl === "string") {
                    message = message.replace(regex, repl);
                }
                else {
                    message = message.replace(regex, repl);
                }
            }
        }
        Global._adapter.log[logFn](message);
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
    return Global;
}());
Global.loglevels = Object.freeze({ off: 0, on: 1, ridiculous: 2 });
Global.severity = Object.freeze({ normal: 0, warn: 1, error: 2 });
Global._loglevel = Global.loglevels.on;
exports.Global = Global;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLmpzIiwic291cmNlUm9vdCI6IkM6L1VzZXJzL0RvbWluaWMvRG9jdW1lbnRzL1Zpc3VhbCBTdHVkaW8gMjAxNy9SZXBvc2l0b3JpZXMvaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9nbG9iYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHFEQUFpRjtBQUNqRix1Q0FBeUQ7QUFFekQscUNBQXFDO0FBRXJDLElBQU0sTUFBTSxHQUFHO0lBQ2QsR0FBRyxFQUFFLFNBQVM7SUFDZCxNQUFNLEVBQUUsU0FBUztJQUNqQixLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsU0FBUztDQUNmLENBQUM7QUFFRixJQUFNLFlBQVksR0FFZDtJQUNILElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQztJQUN2QyxNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUM7SUFDdkMsU0FBUyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO0lBQzFDLGFBQWEsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFdBQVcsQ0FBQztJQUNoRCxLQUFLLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUM3QyxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUV2QixNQUFNLENBQUMsMEJBQXVCLEtBQUssV0FBSyxFQUFFLFlBQVMsQ0FBQztRQUNyRCxDQUFDLENBQUM7SUFDRixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtZQUNqRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFD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