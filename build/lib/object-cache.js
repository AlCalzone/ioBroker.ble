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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var objects_1 = require("alcalzone-shared/objects");
var sorted_list_1 = require("alcalzone-shared/sorted-list");
var global_1 = require("./global");
var ObjectCache = /** @class */ (function () {
    /**
     * @param expiryDuration The timespan after which cached objects are expired automatically
     */
    function ObjectCache(expiryDuration) {
        if (expiryDuration === void 0) { expiryDuration = false; }
        this.expiryDuration = expiryDuration;
        this.cache = new Map();
        this.expireTimestamps = new sorted_list_1.SortedList();
    }
    /**
     * Retrieves an object from the cache or queries the database if it is not cached yet
     * @param id The id of the object to retrieve
     */
    ObjectCache.prototype.getObject = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.cache.has(id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, global_1.Global.adapter.$getForeignObject(id)];
                    case 1:
                        ret = _a.sent();
                        // and remember it in the cache
                        if (ret != null)
                            this.storeObject(ret);
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.retrieveObject(id)];
                }
            });
        });
    };
    ObjectCache.prototype.storeObject = function (obj) {
        var clone = objects_1.extend({}, obj);
        this.cache.set(clone._id, clone);
        this.rememberForExpiry(clone._id);
    };
    ObjectCache.prototype.retrieveObject = function (id) {
        if (this.cache.has(id)) {
            return objects_1.extend({}, this.cache.get(id));
        }
    };
    ObjectCache.prototype.rememberForExpiry = function (id) {
        var _this = this;
        if (typeof this.expiryDuration !== "number")
            return;
        var existingTimestamp = __spread(this.expireTimestamps).find(function (ets) { return ets.id === id; });
        if (existingTimestamp != null) {
            this.expireTimestamps.remove(existingTimestamp);
        }
        var newTimestamp = {
            timestamp: Date.now() + this.expiryDuration,
            id: id,
        };
        this.expireTimestamps.add(newTimestamp);
        // if no expiry timer is running, start one
        if (this.expireTimer == null) {
            this.expireTimer = setTimeout(function () { return _this.expire(); }, this.expiryDuration);
        }
    };
    ObjectCache.prototype.expire = function () {
        this.expireTimer = undefined;
        if (this.expireTimestamps.length === 0)
            return;
        var nextTimestamp = this.expireTimestamps.shift();
        var timeDelta = nextTimestamp.timestamp - Date.now();
        if (timeDelta <= 0) {
            // it has expired
            this.invalidateObject(nextTimestamp.id);
        }
        else {
            // it hasn't, so re-add it
            // TODO: We need a peek method in the sorted list
            this.expireTimestamps.add(nextTimestamp);
        }
        this.setTimerForNextExpiry();
    };
    ObjectCache.prototype.setTimerForNextExpiry = function () {
        var _this = this;
        if (this.expireTimestamps.length === 0)
            return;
        // workaround for missing peek();
        var nextTimestamp = this.expireTimestamps.shift();
        this.expireTimestamps.add(nextTimestamp);
        var timeDelta = nextTimestamp.timestamp - Date.now();
        this.expireTimer = setTimeout(function () { return _this.expire(); }, Math.max(timeDelta, 100));
    };
    /**
     * Causes the cache for an object to be invalidated
     * @param id The id of the object to invalidate
     */
    ObjectCache.prototype.invalidateObject = function (id) {
        this.cache.delete(id);
    };
    /**
     * Updates an object in the cache
     * @param id The id of the object to update
     * @param obj The updated object
     */
    ObjectCache.prototype.updateObject = function (obj) {
        this.storeObject(obj);
    };
    ObjectCache.prototype.dispose = function () {
        if (this.expireTimer != undefined) {
            clearTimeout(this.expireTimer);
            this.expireTimer = undefined;
        }
        this.cache.clear();
    };
    return ObjectCache;
}());
exports.ObjectCache = ObjectCache;
