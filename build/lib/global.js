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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var async_1 = require("alcalzone-shared/async");
var objects_1 = require("alcalzone-shared/objects");
var fs = require("fs");
var path = require("path");
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
    Object.defineProperty(Global, "objectCache", {
        get: function () { return Global._objectCache; },
        set: function (cache) {
            Global._objectCache = cache;
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
            ret.objects.$getObjectList = async_1.promisify(adapter.objects.getObjectList, adapter.objects);
            ret = Object.assign(ret, {
                $getObject: async_1.promisify(adapter.getObject, adapter),
                $setObject: async_1.promisify(adapter.setObject, adapter),
                $setObjectNotExists: async_1.promisify(adapter.setObjectNotExists, adapter),
                $extendObject: async_1.promisify(adapter.extendObject, adapter),
                $getAdapterObjects: async_1.promisify(adapter.getAdapterObjects, adapter),
                $getForeignObject: async_1.promisify(adapter.getForeignObject, adapter),
                $setForeignObject: async_1.promisify(adapter.setForeignObject, adapter),
                $setForeignObjectNotExists: async_1.promisify(adapter.setForeignObjectNotExists, adapter),
                $extendForeignObject: async_1.promisify(adapter.extendForeignObject, adapter),
                $getForeignObjects: async_1.promisify(adapter.getForeignObjects, adapter),
                $createDevice: async_1.promisify(adapter.createDevice, adapter),
                $deleteDevice: async_1.promisify(adapter.deleteDevice, adapter),
                $createChannel: async_1.promisify(adapter.createChannel, adapter),
                $deleteChannel: async_1.promisify(adapter.deleteChannel, adapter),
                $getState: async_1.promisify(adapter.getState, adapter),
                $getStates: async_1.promisify(adapter.getStates, adapter),
                $setState: async_1.promisify(adapter.setState, adapter),
                $setStateChanged: async_1.promisify(adapter.setStateChanged, adapter),
                $createState: async_1.promisify(adapter.createState, adapter),
                $deleteState: async_1.promisify(adapter.deleteState, adapter),
                $delState: async_1.promisify(adapter.delState, adapter),
                $getForeignState: async_1.promisify(adapter.getForeignState, adapter),
                $setForeignState: async_1.promisify(adapter.setForeignState, adapter),
                $setForeignStateChanged: async_1.promisify(adapter.setForeignStateChanged, adapter),
                $sendTo: async_1.promisifyNoError(adapter.sendTo, adapter),
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
            for (var _i = 0, _a = objects_1.entries(replacements); _i < _a.length; _i++) {
                var _b = _a[_i], _c = _b[1], regex = _c[0], repl = _c[1];
                if (typeof repl === "string") {
                    message = message.replace(regex, repl);
                }
                else { // a bit verbose, but TS doesn't get the overload thingy here
                    message = message.replace(regex, repl);
                }
            }
        }
        if (level === "silly" && !(level in Global._adapter.log))
            level = "debug";
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
                            return [2 /*return*/, objects_1.filter(objects, function (o) { return o.common.role === role; })];
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
