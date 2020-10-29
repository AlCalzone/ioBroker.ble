/** noble-Treiber-Instanz */
import type { Peripheral } from "@abandonware/noble";
import * as yargs from "yargs";
import { ScanExitCodes, ScanMessage } from "./lib/scanProcessInterface";

/** Define command line arguments */
const argv = yargs
	.env("IOB_BLE")
	.strict()
	.usage("ioBroker.ble scanner process\n\nUsage: $0 [options]")
	.options({
		hciDevice: {
			alias: "-d",
			type: "number",
			desc: "Index of the HCI device to use for scanning",
			default: 0,
		},
		services: {
			alias: "-s",
			type: "array",
			desc: "Which BLE services to scan for",
			default: [],
		},
	}).argv;

let noble: typeof import("@abandonware/noble");

function sendAsync(
	message: ScanMessage,
	sendHandle?: any,
	swallowErrors: boolean = true,
): Promise<void> {
	return new Promise((resolve, reject) => {
		process.send!(message, sendHandle, undefined, (err) => {
			if (err && !swallowErrors) reject(err);
			else resolve();
		});
	});
}

process.on("uncaughtException", (error) => {
	// Delegate the error to the parent process and let it decide whether to shut down the scanning process
	sendAsync({ type: "error", error });
});
process.on("unhandledRejection", (error) => {
	// Delegate the error to the parent process and let it decide whether to shut down the scanning process
	sendAsync({
		type: "error",
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		error: error instanceof Error ? error : new Error(`${error}`),
	});
});

function onDiscover(peripheral?: Peripheral) {
	if (peripheral == undefined) return;
	sendAsync({ type: "discover" }, peripheral);
}

let isScanning = false;
async function startScanning() {
	if (isScanning) return;
	await sendAsync({ type: "connected" });
	await sendAsync({
		type: "log",
		message: `starting scan for services ${JSON.stringify(argv.services)}`,
	});
	// We must allow duplicates in order to support
	noble.on("discover", onDiscover);
	await noble.startScanningAsync(argv.services, true);
	isScanning = true;
}

async function stopScanning() {
	if (!isScanning) return;
	noble.removeAllListeners("discover");
	sendAsync({
		type: "log",
		message: `stopping scan`,
	});
	noble.stopScanning();
	sendAsync({ type: "disconnected" });
	isScanning = false;
}

(async () => {
	// load noble driver with the correct device selected
	process.env.NOBLE_HCI_DEVICE_ID = argv.hciDevice.toString();
	try {
		noble = require("@abandonware/noble");
	} catch (error) {
		await sendAsync({ type: "fatal", error });
		process.exit(ScanExitCodes.RequireNobleFailed);
	}

	// prepare scanning for beacons
	noble.on("stateChange", (state) => {
		switch (state) {
			case "poweredOn":
				startScanning();
				break;
			case "poweredOff":
				stopScanning();
				break;
		}
		sendAsync({ type: "driverState", driverState: state });
	});
	if (noble.state === "poweredOn") startScanning();
	sendAsync({ type: "driverState", driverState: noble.state });
})();
