"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = require("./global");
var str2regex_1 = require("./str2regex");
var customStateSubscriptions = {
    subscriptions: new Map(),
    counter: 0,
};
var customObjectSubscriptions = {
    subscriptions: new Map(),
    counter: 0,
};
/**
 * Ensures the subscription pattern is valid
 */
function checkPattern(pattern) {
    try {
        if (typeof pattern === "string") {
            return str2regex_1.str2regex(pattern);
        }
        else if (pattern instanceof RegExp) {
            return pattern;
        }
        else {
            // NOPE
            throw new Error("The pattern must be regex or string");
        }
    }
    catch (e) {
        global_1.Global.log("cannot subscribe with this pattern. reason: " + e);
        return null;
    }
}
function applyCustomStateSubscriptions(id, state) {
    var e_1, _a;
    try {
        try {
            for (var _b = __values(customStateSubscriptions.subscriptions.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sub = _c.value;
                if (sub
                    && sub.pattern
                    && sub.pattern.test(id)
                    && typeof sub.callback === "function") {
                    // Wenn die ID zum aktuellen Pattern passt, dann Callback aufrufen
                    sub.callback(id, state);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (e) {
        global_1.Global.log("error handling custom sub: " + e);
    }
}
exports.applyCustomStateSubscriptions = applyCustomStateSubscriptions;
function applyCustomObjectSubscriptions(id, obj) {
    var e_2, _a;
    try {
        try {
            for (var _b = __values(customObjectSubscriptions.subscriptions.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var sub = _c.value;
                if (sub
                    && sub.pattern
                    && sub.pattern.test(id)
                    && typeof sub.callback === "function") {
                    // Wenn die ID zum aktuellen Pattern passt, dann Callback aufrufen
                    sub.callback(id, obj);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    catch (e) {
        global_1.Global.log("error handling custom sub: " + e);
    }
}
exports.applyCustomObjectSubscriptions = applyCustomObjectSubscriptions;
/**
 * Subscribe to some ioBroker states
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
function subscribeStates(pattern, callback) {
    pattern = checkPattern(pattern);
    if (!pattern)
        return;
    var newCounter = (++customStateSubscriptions.counter);
    var id = "" + newCounter;
    customStateSubscriptions.subscriptions.set(id, { pattern: pattern, callback: callback });
    return id;
}
exports.subscribeStates = subscribeStates;
/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeStates}
 */
function unsubscribeStates(id) {
    if (customStateSubscriptions.subscriptions.has(id)) {
        customStateSubscriptions.subscriptions.delete(id);
    }
}
exports.unsubscribeStates = unsubscribeStates;
/**
 * Subscribe to some ioBroker objects
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
function subscribeObjects(pattern, callback) {
    pattern = checkPattern(pattern);
    if (!pattern)
        return;
    var newCounter = (++customObjectSubscriptions.counter);
    var id = "" + newCounter;
    customObjectSubscriptions.subscriptions.set(id, { pattern: pattern, callback: callback });
    return id;
}
exports.subscribeObjects = subscribeObjects;
/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeObjects}
 */
function unsubscribeObjects(id) {
    if (customObjectSubscriptions.subscriptions.has(id)) {
        customObjectSubscriptions.subscriptions.delete(id);
    }
}
exports.unsubscribeObjects = unsubscribeObjects;
/** Clears all custom subscriptions */
function clearCustomSubscriptions() {
    customStateSubscriptions.subscriptions.clear();
    customObjectSubscriptions.subscriptions.clear();
}
exports.clearCustomSubscriptions = clearCustomSubscriptions;
