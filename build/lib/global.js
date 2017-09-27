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
    return Global;
}());
Global.loglevels = Object.freeze({ off: 0, on: 1, ridiculous: 2 });
Global.severity = Object.freeze({ normal: 0, warn: 1, error: 2 });
Global._loglevel = Global.loglevels.on;
exports.Global = Global;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLmpzIiwic291cmNlUm9vdCI6IkM6L1VzZXJzL0RvbWluaWMvRG9jdW1lbnRzL1Zpc3VhbCBTdHVkaW8gMjAxNy9SZXBvc2l0b3JpZXMvaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9nbG9iYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVCQUF5QjtBQUN6QiwyQkFBNkI7QUFDN0IscURBQWlGO0FBQ2pGLHVDQUF5RDtBQUV6RCxxQ0FBcUM7QUFFckMsSUFBTSxNQUFNLEdBQUc7SUFDZCxHQUFHLEVBQUUsU0FBUztJQUNkLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLElBQUksRUFBRSxTQUFTO0NBQ2YsQ0FBQztBQUVGLElBQU0sWUFBWSxHQUVkO0lBQ0gsSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDO0lBQ3ZDLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQztJQUN2QyxTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUM7SUFDMUMsYUFBYSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsV0FBVyxDQUFDO0lBQ2hELEtBQUssRUFBRSxDQUFDLHdCQUF3QixFQUFFLFVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQzdDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1lBRXZCLE1BQU0sQ0FBQywwQkFBdUIsS0FBSyxXQUFLLEVBQUUsWUFBUyxDQUFDO1FBQ3JELENBQUMsQ0FBQztJQUNGLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLFVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO1lBQ2pELElBQU0sS0FBSyxHQUFHLE1B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