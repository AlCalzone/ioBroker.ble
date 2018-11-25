"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
const fs = require("fs");
const path = require("path");
// Get js-controller directory to load libs
function getControllerDir(isInstall) {
    // Find the js-controller location
    const possibilities = [
        "iobroker.js-controller",
        "ioBroker.js-controller",
    ];
    let controllerPath;
    for (const pkg of possibilities) {
        try {
            const possiblePath = require.resolve(pkg);
            if (fs.existsSync(possiblePath)) {
                controllerPath = possiblePath;
                break;
            }
        }
        catch ( /* not found */_a) { /* not found */ }
    }
    if (controllerPath == undefined) {
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
const controllerDir = getControllerDir(typeof process !== "undefined" && process.argv && process.argv.indexOf("--install") !== -1);
function getConfig() {
    return JSON.parse(fs.readFileSync(path.join(controllerDir, "conf/iobroker.json"), "utf8"));
}
const adapter = require(path.join(controllerDir, "lib/adapter.js"));
exports.default = {
    controllerDir: controllerDir,
    getConfig: getConfig,
    adapter: adapter,
};
