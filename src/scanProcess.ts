/** noble-Treiber-Instanz */
import type { Peripheral } from "@abandonware/noble";
import * as yargs from "yargs";
import { pick } from "./lib/misc";
import {
	PeripheralInfo,
	ScanExitCodes,
	ScanMessage,
} from "./lib/scanProcessInterface";

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
	})
	.parseSync();

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

// @ts-expect-error We need this to serialize and deserialize Error objects
Error.prototype.toJSON = function (this: Error) {
	const ret: Record<string, any> = {
		type: "Error",
		name: this.name,
		message: this.message,
		stack: this.stack,
	};
	// Add any custom properties such as .code in file-system errors
	for (const key of Object.keys(this) as (keyof Error)[]) {
		if (!ret[key]) {
			ret[key] = this[key];
		}
	}
	return ret;
};

process.on("uncaughtException", (error) => {
	// Delegate the error to the parent process and let it decide whether to shut down the scanning process
	sendAsync({ type: "error", error });
});
process.on("unhandledRejection", (error) => {
	// Delegate the error to the parent process and let it decide whether to shut down the scanning process
	sendAsync({
		type: "error",
		error:
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			error instanceof Error ? error : new Error(`${error}`),
	});
});

process.on("message", (msg) => {
	switch (msg) {
		case "startScanning":
			startScanning();
			break;
		case "stopScanning":
			stopScanning();
			break;
	}
});

function serializePeripheral(peripheral: Peripheral): PeripheralInfo {
	return pick(peripheral, [
		"id",
		"uuid",
		"address",
		"addressType",
		"connectable",
		"advertisement",
		"rssi",
		"services",
		"state",
	]);
}

function onDiscover(peripheral?: Peripheral) {
	if (peripheral == undefined) return;
	sendAsync({
		type: "discover",
		peripheral: serializePeripheral(peripheral),
	});
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
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		noble = require("@abandonware/noble");
		if (typeof noble.on !== "function") {
			// The following commit broke the default exported instance of noble:
			// https://github.com/abandonware/noble/commit/b67eea246f719947fc45b1b52b856e61637a8a8e
			noble = (noble as any)({ extended: false });
		}
	} catch (error: any) {
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
