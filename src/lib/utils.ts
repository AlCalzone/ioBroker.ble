// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
import * as fs from "fs";

// Get js-controller directory to load libs
function getControllerDir(isInstall): string {
    // Find the js-controller location
    var controllerDir: string | string[] = __dirname.replace(/\\/g, '/');
    controllerDir = controllerDir.split('/');
    if (controllerDir[controllerDir.length - 4] === 'adapter') {
        controllerDir.splice(controllerDir.length - 4, 4);
        controllerDir = controllerDir.join('/');
    } else if (controllerDir[controllerDir.length - 4] === 'node_modules') {
        controllerDir.splice(controllerDir.length - 4, 4);
        controllerDir = controllerDir.join('/');
        if (fs.existsSync(controllerDir + '/node_modules/iobroker.js-controller')) {
            controllerDir += '/node_modules/iobroker.js-controller';
        } else if (fs.existsSync(controllerDir + '/node_modules/ioBroker.js-controller')) {
            controllerDir += '/node_modules/ioBroker.js-controller';
        } else if (!fs.existsSync(controllerDir + '/controller.js')) {
            if (!isInstall) {
                console.log("Cannot find js-controller");
                process.exit(10);
            } else {
                process.exit();
            }
        }
    } else {
        if (!isInstall) {
            console.log("Cannot find js-controller");
            process.exit(10);
        } else {
            process.exit();
        }
    }
    return controllerDir as string;
}

// Read controller configuration file
const controllerDir = getControllerDir(typeof process !== "undefined" && process.argv && process.argv.indexOf("--install") !== -1);
function getConfig() {
    return JSON.parse(fs.readFileSync(controllerDir + "/conf/iobroker.json", "utf8"));
}

const adapter = require(controllerDir + "/lib/adapter.js");

export default {
    controllerDir: controllerDir,
    getConfig: getConfig,
    adapter: adapter,
} as {
    readonly controllerDir: string;
    getConfig(): string;
    adapter(adapterName: string): ioBroker.Adapter;
    adapter(adapterOptions: ioBroker.AdapterOptions): ioBroker.Adapter;
};
