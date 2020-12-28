"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectCache = void 0;
const objects_1 = require("alcalzone-shared/objects");
const sorted_list_1 = require("alcalzone-shared/sorted-list");
const global_1 = require("./global");
function compareExpireTimestamp(a, b) {
    return Math.sign(b.timestamp - a.timestamp);
}
class ObjectCache {
    /**
     * @param expiryDuration The timespan after which cached objects are expired automatically
     */
    constructor(expiryDuration = false) {
        this.expiryDuration = expiryDuration;
        this.cache = new Map();
        this.expireTimestamps = new sorted_list_1.SortedList(undefined, compareExpireTimestamp);
    }
    /**
     * Retrieves an object from the cache or queries the database if it is not cached yet
     * @param id The id of the object to retrieve
     */
    async getObject(id) {
        if (!this.cache.has(id)) {
            // retrieve the original object from the DB
            const ret = await global_1.Global.adapter.getForeignObjectAsync(id);
            // and remember it in the cache
            if (ret != null)
                this.storeObject(ret);
        }
        return this.retrieveObject(id);
    }
    async objectExists(id) {
        if (this.cache.has(id))
            return true;
        // Try to retrieve the original object from the DB
        const ret = await global_1.Global.adapter.getForeignObjectAsync(id);
        return ret != undefined;
    }
    storeObject(obj) {
        const clone = objects_1.extend({}, obj);
        this.cache.set(clone._id, clone);
        this.rememberForExpiry(clone._id);
    }
    retrieveObject(id) {
        if (this.cache.has(id)) {
            return objects_1.extend({}, this.cache.get(id));
        }
    }
    rememberForExpiry(id) {
        if (typeof this.expiryDuration !== "number")
            return;
        const existingTimestamp = [...this.expireTimestamps].find((ets) => ets.id === id);
        if (existingTimestamp != null) {
            this.expireTimestamps.remove(existingTimestamp);
        }
        const newTimestamp = {
            timestamp: Date.now() + this.expiryDuration,
            id,
        };
        this.expireTimestamps.add(newTimestamp);
        // if no expiry timer is running, start one
        if (this.expireTimer == null) {
            this.expireTimer = setTimeout(() => this.expire(), this.expiryDuration);
        }
    }
    expire() {
        this.expireTimer = undefined;
        if (this.expireTimestamps.length === 0)
            return;
        const nextTimestamp = this.expireTimestamps.peekStart();
        const timeDelta = nextTimestamp.timestamp - Date.now();
        if (timeDelta <= 0) {
            // it has expired
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
        this.expireTimer = setTimeout(() => this.expire(), Math.max(timeDelta, 100));
    }
    /**
     * Causes the cache for an object to be invalidated
     * @param id The id of the object to invalidate
     */
    invalidateObject(id) {
        this.cache.delete(id);
    }
    /**
     * Updates an object in the cache
     * @param id The id of the object to update
     * @param obj The updated object
     */
    updateObject(obj) {
        this.storeObject(obj);
    }
    dispose() {
        if (this.expireTimer != undefined) {
            clearTimeout(this.expireTimer);
            this.expireTimer = undefined;
        }
        this.cache.clear();
    }
}
exports.ObjectCache = ObjectCache;
//# sourceMappingURL=object-cache.js.map