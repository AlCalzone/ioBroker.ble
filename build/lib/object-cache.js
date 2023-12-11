"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var object_cache_exports = {};
__export(object_cache_exports, {
  ObjectCache: () => ObjectCache
});
module.exports = __toCommonJS(object_cache_exports);
var import_objects = require("alcalzone-shared/objects");
var import_sorted_list = require("alcalzone-shared/sorted-list");
var import_global = require("./global");
function compareExpireTimestamp(a, b) {
  return Math.sign(b.timestamp - a.timestamp);
}
class ObjectCache {
  constructor(expiryDuration = false) {
    this.expiryDuration = expiryDuration;
  }
  cache = /* @__PURE__ */ new Map();
  expireTimestamps = new import_sorted_list.SortedList(
    void 0,
    compareExpireTimestamp
  );
  expireTimer;
  async getObject(id) {
    if (!this.cache.has(id)) {
      const ret = await import_global.Global.adapter.getForeignObjectAsync(id);
      if (ret != null)
        this.storeObject(ret);
    }
    return this.retrieveObject(id);
  }
  async objectExists(id) {
    if (this.cache.has(id))
      return true;
    const ret = await import_global.Global.adapter.getForeignObjectAsync(id);
    return ret != void 0;
  }
  storeObject(obj) {
    const clone = (0, import_objects.extend)({}, obj);
    this.cache.set(clone._id, clone);
    this.rememberForExpiry(clone._id);
  }
  retrieveObject(id) {
    if (this.cache.has(id)) {
      return (0, import_objects.extend)({}, this.cache.get(id));
    }
  }
  rememberForExpiry(id) {
    if (typeof this.expiryDuration !== "number")
      return;
    const existingTimestamp = [...this.expireTimestamps].find(
      (ets) => ets.id === id
    );
    if (existingTimestamp != null) {
      this.expireTimestamps.remove(existingTimestamp);
    }
    const newTimestamp = {
      timestamp: Date.now() + this.expiryDuration,
      id
    };
    this.expireTimestamps.add(newTimestamp);
    if (this.expireTimer == null) {
      this.expireTimer = setTimeout(
        () => this.expire(),
        this.expiryDuration
      );
    }
  }
  expire() {
    this.expireTimer = void 0;
    if (this.expireTimestamps.length === 0)
      return;
    const nextTimestamp = this.expireTimestamps.peekStart();
    const timeDelta = nextTimestamp.timestamp - Date.now();
    if (timeDelta <= 0) {
      this.invalidateObject(nextTimestamp.id);
      this.expireTimestamps.remove(nextTimestamp);
    }
    this.setTimerForNextExpiry();
  }
  setTimerForNextExpiry() {
    if (this.expireTimestamps.length === 0)
      return;
    const nextTimestamp = this.expireTimestamps.peekStart();
    const timeDelta = nextTimestamp.timestamp - Date.now();
    this.expireTimer = setTimeout(
      () => this.expire(),
      Math.max(timeDelta, 100)
    );
  }
  invalidateObject(id) {
    this.cache.delete(id);
  }
  updateObject(obj) {
    this.storeObject(obj);
  }
  dispose() {
    if (this.expireTimer != void 0) {
      clearTimeout(this.expireTimer);
      this.expireTimer = void 0;
    }
    this.cache.clear();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ObjectCache
});
//# sourceMappingURL=object-cache.js.map
