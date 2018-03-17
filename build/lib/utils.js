"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
var fs = require("fs");
var path = require("path");
// Get js-controller directory to load libs
function getControllerDir(isInstall) {
    // Find the js-controller location
    var possibilities = [
        "iobroker.js-controller",
        "ioBroker.js-controller",
    ];
    var controllerPath;
    for (var _i = 0, possibilities_1 = possibilities; _i < possibilities_1.length; _i++) {
        var pkg = possibilities_1[_i];
        try {
            var possiblePath = require.resolve(pkg);
            if (fs.existsSync(possiblePath)) {
                controllerPath = possiblePath;
                break;
            }
        }
        catch (_a) { }
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
