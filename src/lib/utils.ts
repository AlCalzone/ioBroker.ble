// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
import * as fs from "fs";
import * as path from "path";

// Get js-controller directory to load libs
function getControllerDir(isInstall: boolean): string {
	// Find the js-controller location
	const possibilities = [
		"iobroker.js-controller",
		"ioBroker.js-controller",
	];
	let controllerPath: string;
	for (const pkg of possibilities) {
		try {
			const possiblePath = require.resolve(pkg);
			if (fs.existsSync(possiblePath)) {
				controllerPath = possiblePath;
				break;
			}
		} catch { /* not found */ }
	}
	if (controllerPath == null) {
		if (!isInstall) {
			console.log("Cannot find js-controller");
			process.exit(10);
		} else {
			process.exit();
		}
	}
	// we found the controller
	return path.dirname(controllerPath);
}

// Read controller configuration file
const controllerDir = getControllerDir(typeof process !== "undefined" && process.argv && process.argv.indexOf("--install") !== -1);
function getConfig() {
	return JSON.parse(
		fs.readFileSync(path.join(controllerDir, "conf/iobroker.json"), "utf8"),
	);
}

const adapter = require(path.join(controllerDir, "lib/adapter.js"));

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
