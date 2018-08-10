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
// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
var fs = require("fs");
var path = require("path");
// Get js-controller directory to load libs
function getControllerDir(isInstall) {
    var e_1, _a;
    // Find the js-controller location
    var possibilities = [
        "iobroker.js-controller",
        "ioBroker.js-controller",
    ];
    var controllerPath;
    try {
        for (var possibilities_1 = __values(possibilities), possibilities_1_1 = possibilities_1.next(); !possibilities_1_1.done; possibilities_1_1 = possibilities_1.next()) {
            var pkg = possibilities_1_1.value;
            try {
                var possiblePath = require.resolve(pkg);
                if (fs.existsSync(possiblePath)) {
                    controllerPath = possiblePath;
                    break;
                }
            }
            catch ( /* not found */_b) { /* not found */ }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (possibilities_1_1 && !possibilities_1_1.done && (_a = possibilities_1.return)) _a.call(possibilities_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (controllerPath == null) {
        if (!isInstall) {
            console.log("Cannot find js-controller");
            process.exit(10);
        }
        else {
            process.exit();
        }
    }
    // we found the controller
    return path.dirname(controllerPath);
}
// Read controller configuration file
var controllerDir = getControllerDir(typeof process !== "undefined" && process.argv && process.argv.indexOf("--install") !== -1);
function getConfig() {
    return JSON.parse(fs.readFileSync(path.join(controllerDir, "conf/iobroker.json"), "utf8"));
}
var adapter = require(path.join(controllerDir, "lib/adapter.js"));
exports.default = {
    controllerDir: controllerDir,
    getConfig: getConfig,
    adapter: adapter,
};
