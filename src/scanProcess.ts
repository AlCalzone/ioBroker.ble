/** noble-Treiber-Instanz */
import type { Peripheral } from "@stoprocent/noble";
import { createServer, type AddressInfo, type Server, type Socket } from "net";
import { pick } from "./lib/misc";
import {
	ScanExitCodes,
	type InboundMessage,
	type PeripheralInfo,
	type ScanMessage,
} from "./lib/scanProcessInterface";
import yargs = require("yargs");

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
			type: "string",
			array: true,
			desc: "Which BLE services to scan for",
			default: [],
		},
		listenInterface: {
			alias: "-i",
			type: "string",
			desc: "If not spawned as a child process, the interface to listen for TCP connections. Default: all interfaces.",
		},
		listenPort: {
			alias: "-p",
			type: "number",
			desc: "If not spawned as a child process, the port to listen on.",
			default: 8734,
		},
	})
	.parseSync();

let noble: typeof import("@stoprocent/noble");
let server: Server | undefined;
const clients: Set<Socket> = new Set();

function sendAsync(
	message: ScanMessage,
	sendHandle?: any,
	swallowErrors: boolean = true,
): Promise<void> {
	if (process.send) {
		return new Promise((resolve, reject) => {
			process.send!(message, sendHandle, undefined, (err) => {
				if (err && !swallowErrors) reject(err);
				else resolve();
			});
		});
	} else {
		const promises = [...clients].map((client) => {
			return new Promise<void>((resolve, reject) => {
				client.write(JSON.stringify(message) + "\n", (err) => {
					if (err && !swallowErrors) reject(err);
					else resolve();
				});
			});
		});
		return Promise.all(promises).then(() => undefined);
	}
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

// This will be called when an IPC channel exists
process.on("message", (msg) => {
	handleMessage(msg as InboundMessage);
});

function handleMessage(msg: InboundMessage) {
	switch (msg.type) {
		case "startScanning":
			startScanning();
			break;
		case "stopScanning":
			stopScanning();
			break;
	}
}

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

function maybeStartServer(): Promise<void> {
	// This is a child process, we have an IPC channel
	if (process.send) return Promise.resolve();

	return new Promise((resolve, reject) => {
		// Start a TCP server, listen for connections, and forward them to the serial port
		server = createServer((socket) => {
			console.log("Client connected");
			clients.add(socket);

			// when the connection is closed, unpipe the streams
			socket.on("close", () => {
				console.log("Client disconnected");
				clients.delete(socket);
			});
		});

		// Do not allow more than one client to connect
		server.maxConnections = 1;

		server.on("error", (err) => {
			if ((err as any).code === "EADDRINUSE") {
				reject(err);
			}
		});
		server.listen(
			{
				host: argv.listenInterface,
				port: argv.listenPort,
			},
			() => {
				const address: AddressInfo = server!.address() as any;
				console.log(
					`Server listening on tcp://${address.address}:${address.port}`,
				);
				resolve();
			},
		);
	});
}

async function loadNoble() {
	// load noble driver with the correct device selected
	process.env.NOBLE_HCI_DEVICE_ID = argv.hciDevice.toString();
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		noble = require("@stoprocent/noble");
		if (typeof noble.on !== "function") {
			// The following commit broke the default exported instance of noble:
			// https://github.com/stoprocent/noble/commit/b67eea246f719947fc45b1b52b856e61637a8a8e
			noble = (noble as any)({ extended: false });
		}
	} catch (error: any) {
		await sendAsync({ type: "fatal", error });
		process.exit(ScanExitCodes.RequireNobleFailed);
	}
}

async function main() {
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
		console.log(`driver state is ${state}`);
		sendAsync({ type: "driverState", driverState: state });
	});
	if (noble.state === "poweredOn") startScanning();
	sendAsync({ type: "driverState", driverState: noble.state });
}

(async () => {
	await loadNoble();
	await maybeStartServer();
	if (server) {
		// wait for connection
		server.once("connection", () => {
			main();
		});
	} else {
		// child process, start scanning immediately
		main();
	}
})();
