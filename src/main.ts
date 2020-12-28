import * as utils from "@iobroker/adapter-core";
import { entries } from "alcalzone-shared/objects";
import { ChildProcess, exec, fork } from "child_process";
import * as path from "path";
import { Global as _ } from "./lib/global";
import {
	extendChannel,
	extendDevice,
	extendState,
} from "./lib/iobroker-objects";
import { ObjectCache } from "./lib/object-cache";
import {
	getMessageReviver,
	PeripheralInfo,
	ScanExitCodes,
	ScanMessage,
} from "./lib/scanProcessInterface";
// Load all registered plugins
import plugins from "./plugins";
import type { Plugin } from "./plugins/plugin";

let enabledPlugins: Plugin[];
let services: string[] = [];

/** Whether new devices may be recorded */
let allowNewDevices = true;
/** Cache of new devices we already ignored */
const ignoredNewDeviceIDs = new Set<string>();

// /** MAC addresses of known devices */
// let knownDevices: string[] = [];

/** How frequent the RSSI of devices should be updated */
let rssiUpdateInterval = 0;

/** A reference to the scanning process */
let scanProcess: ChildProcess | undefined;

// Adapter-Objekt erstellen
const adapter = utils.adapter({
	name: "ble",
	// is called when databases are connected and adapter received configuration.
	// start here!
	ready: async () => {
		// Adapter-Instanz global machen
		_.adapter = adapter;

		// Cache objects for 1 minute
		_.objectCache = new ObjectCache(60000);

		// Workaround für fehlende InstanceObjects nach update
		await _.ensureInstanceObjects();

		// Prüfen, ob wir neue Geräte erfassen dürfen
		const allowNewDevicesState = await adapter.getStateAsync(
			"options.allowNewDevices",
		);
		allowNewDevices =
			allowNewDevicesState && allowNewDevicesState.val != undefined
				? ((allowNewDevicesState.val as unknown) as boolean)
				: true;
		await adapter.setStateAsync(
			"options.allowNewDevices",
			allowNewDevices,
			true,
		);

		// Plugins laden
		_.adapter.log.info(
			`loaded plugins: ${plugins.map((p) => p.name).join(", ")}`,
		);
		const enabledPluginNames: string[] = (
			(adapter.config.plugins as string) || ""
		)
			.split(",")
			.map((p: string) => p.trim().toLowerCase())
			.concat("_default");
		enabledPlugins = plugins.filter(
			(p) => enabledPluginNames.indexOf(p.name.toLowerCase()) > -1,
		);
		_.adapter.log.info(
			`enabled plugins: ${enabledPlugins.map((p) => p.name).join(", ")}`,
		);

		// Bring the monitored service names into the correct form
		if (adapter.config.services === "*") {
			services = [];
			_.adapter.log.info(`monitoring all services`);
		} else {
			services = (adapter.config.services as string)
				.split(",") // get manually defined services
				.concat(...enabledPlugins.map((p) => p.advertisedServices)) // concat with plugin-defined ones
				.reduce((acc, s) => acc.concat(s), [] as string[]) // flatten the arrays
				.map((s) => fixServiceName(s)) // cleanup the names
				.filter((s) => s !== "")
				.reduce((acc: any[], s) => {
					// filter out duplicates
					if (acc.indexOf(s) === -1) acc.push(s);
					return acc;
				}, []);
			_.adapter.log.info(`monitored services: ${services.join(", ")}`);
		}

		// Limit RSSI updates
		if (adapter.config.rssiThrottle != null) {
			rssiUpdateInterval = Math.max(
				0,
				Math.min(10000, adapter.config.rssiThrottle),
			);
		}
		// monitor our own states and objects
		adapter.subscribeStates("*");
		adapter.subscribeObjects("*");

		// And start scanning
		if (!process.env.TESTING) startScanProcess();
	},

	// is called when adapter shuts down - callback has to be called under any circumstances!
	unload: (callback) => {
		try {
			scanProcess?.kill();
		} catch {}
		callback();
	},

	// is called if a subscribed object changes
	objectChange: (id, obj) => {
		if (!!obj) {
			// it has just been changed, so update the cached object
			_.objectCache.updateObject(obj);
		} else {
			// it has been deleted, so delete it from the cache
			_.objectCache.invalidateObject(id);
		}
	},

	// is called if a subscribed state changes
	stateChange: (id, state) => {
		if (
			/options\.allowNewDevices$/.test(id) &&
			state != undefined &&
			!state.ack
		) {
			if (typeof state.val === "boolean") {
				allowNewDevices = state.val;
				// ACK the state change
				_.adapter.setState(id, state.val, true);
				// Whenever allowNewDevices is set to true,
				// forget all devices we previously ignored
				if (allowNewDevices) ignoredNewDeviceIDs.clear();
			}
		}
	},

	message: async (obj) => {
		// responds to the adapter that sent the original message
		function respond(response: any) {
			if (obj.callback)
				adapter.sendTo(obj.from, obj.command, response, obj.callback);
		}
		// some predefined responses so we only have to define them once
		const predefinedResponses = {
			ACK: { error: null },
			OK: { error: null, result: "ok" },
			ERROR_UNKNOWN_COMMAND: { error: "Unknown command!" },
			MISSING_PARAMETER: (paramName: string) => {
				return { error: 'missing parameter "' + paramName + '"!' };
			},
			COMMAND_RUNNING: { error: "command running" },
		};
		// make required parameters easier
		// function requireParams(params: string[]) {
		// 	if (!(params && params.length)) return true;
		// 	for (const param of params) {
		// 		if (!(obj.message && obj.message.hasOwnProperty(param))) {
		// 			respond(predefinedResponses.MISSING_PARAMETER(param));
		// 			return false;
		// 		}
		// 	}
		// 	return true;
		// }

		// handle the message
		if (obj) {
			switch (obj.command) {
				case "getHCIPorts":
					exec("hciconfig | grep hci", (error, stdout, _stderr) => {
						// hci1:   Type: BR/EDR  Bus: USB
						// hci0:   Type: BR/EDR  Bus: UART
						if (error != null) {
							respond({ error });
							return;
						}
						// parse index and bus type
						const ports: { index: number; bus: string }[] = [];
						const regex = /^hci(\d+)\:.+Bus\:\s(\w+)$/gm;
						let result: RegExpExecArray | null;

						while (true) {
							result = regex.exec(stdout);
							if (!(result && result.length)) break;
							const port = { index: +result[1], bus: result[2] };
							ports.push(port);
						}
						respond({ error: null, result: ports });
					});
					return;
				default:
					respond(predefinedResponses.ERROR_UNKNOWN_COMMAND);
					return;
			}
		}
	},
});

function startScanProcess() {
	const args: string[] = ["-s", ...services];
	if (adapter.config.hciDevice) {
		args.push("-d", adapter.config.hciDevice.toString());
	}
	adapter.log.info("starting scanner process...");
	scanProcess = fork(path.join(__dirname, "scanProcess"), args, {
		stdio: ["pipe", "pipe", "pipe", "ipc"],
	}).on("exit", (code, signal) => {
		if (
			!signal &&
			code !== 0 &&
			code !== ScanExitCodes.RequireNobleFailed
		) {
			adapter.log.warn("scanner process crashed, restarting...");
			setImmediate(startScanProcess);
		} else {
			scanProcess = undefined;
		}
	});
	scanProcess.on(
		"message",
		getMessageReviver((message: ScanMessage) => {
			switch (message.type) {
				case "connected":
					adapter.setState("info.connection", true, true);
					break;
				case "disconnected":
					adapter.setState("info.connection", false, true);
					break;
				case "discover":
					onDiscover(message.peripheral);
					break;
				case "driverState":
					adapter.setState(
						"info.driverState",
						message.driverState,
						true,
					);
					break;
				case "error": // fall through
				case "fatal":
					handleScanProcessError(message.error);
					break;
				case "log":
					adapter.log[message.level ?? "info"](message.message);
					break;
			}
		}),
	);
}

function fixServiceName(name: string | null | undefined): string {
	if (name == null) return "";
	name = name.trim();
	// No whitespace
	for (const char of ["\r", "\n", "\t", " "]) {
		name = name.replace(char, "");
	}
	// No leading 0x
	name = name.replace(/^0x/, "");
	// lowerCase
	return name.toLowerCase();
}

async function onDiscover(peripheral: PeripheralInfo) {
	if (peripheral == null) return;

	let serviceDataIsNotEmpty = false;
	let manufacturerDataIsNotEmpty = false;

	_.adapter.log.debug(`discovered peripheral ${peripheral.address}`);
	_.adapter.log.debug(
		`  has advertisement: ${peripheral.advertisement != null}`,
	);
	if (peripheral.advertisement != null) {
		_.adapter.log.debug(
			`  has serviceData: ${
				peripheral.advertisement.serviceData != null
			}`,
		);
		if (peripheral.advertisement.serviceData != null) {
			_.adapter.log.debug(
				`  serviceData = ${JSON.stringify(
					peripheral.advertisement.serviceData,
				)}`,
			);
			serviceDataIsNotEmpty =
				peripheral.advertisement.serviceData.length > 0;
		}
		_.adapter.log.debug(
			`  has manufacturerData: ${
				peripheral.advertisement.manufacturerData != null
			}`,
		);
		if (peripheral.advertisement.manufacturerData != null) {
			_.adapter.log.debug(
				`  manufacturerData = ${peripheral.advertisement.manufacturerData.toString(
					"hex",
				)}`,
			);
			manufacturerDataIsNotEmpty =
				peripheral.advertisement.manufacturerData.length > 0;
		}
	} else {
		// don't create devices for peripherals without advertised data
		return;
	}
	// create devices if we selected to allow empty devices
	// or the peripheral transmits serviceData or manufacturerData
	if (
		!adapter.config.allowEmptyDevices &&
		!serviceDataIsNotEmpty &&
		!manufacturerDataIsNotEmpty
	) {
		return;
	}

	const deviceId = peripheral.address;

	// find out which plugin is handling this
	let plugin: Plugin | undefined;
	for (const p of enabledPlugins) {
		if (p.isHandling(peripheral)) {
			_.adapter.log.debug(`plugin ${p.name} is handling ${deviceId}`);
			plugin = p;
			break;
		}
	}
	if (!plugin) {
		_.adapter.log.warn(
			`no handling plugin found for peripheral ${peripheral.id}`,
		);
		return;
	}

	// Test if we may record this device
	if (!allowNewDevices) {
		// We may not. First test if we already ignored this device
		if (ignoredNewDeviceIDs.has(deviceId)) return;
		// If not, check if the RSSI object exists, as that exists for every one
		if (
			!(await _.objectCache.objectExists(
				`${_.adapter.namespace}.${deviceId}.rssi`,
			))
		) {
			// This is a new device. Remember that we need to ignore it
			ignoredNewDeviceIDs.add(deviceId);
			return;
		}
		// This is a known device
	}

	// Always ensure the rssi state exists and gets a value
	await extendState(`${deviceId}.rssi`, {
		id: "rssi",
		common: {
			role: "value.rssi",
			name: "signal strength (RSSI)",
			desc: "Signal strength of the device",
			type: "number",
			read: true,
			write: false,
		},
		native: {},
	});
	// update RSSI information
	const rssiState = await adapter.getStateAsync(`${deviceId}.rssi`);
	if (
		rssiState == null ||
		// Allow updating the unchanged state because some people use it for presence detection
		rssiState.ts + rssiUpdateInterval < Date.now() // But don't update too frequently
	) {
		_.adapter.log.debug(`updating rssi state for ${deviceId}`);
		await adapter.setStateAsync(`${deviceId}.rssi`, peripheral.rssi, true);
	}

	// Now update device-specific objects and states
	const context = plugin.createContext(peripheral);
	const objects = plugin.defineObjects(context);
	const values = plugin.getValues(context);

	// We can't do anything without objects
	if (objects == null) return;

	// Ensure the device object exists
	await extendDevice(deviceId, peripheral, objects.device);
	// Ensure the channel objects exist (optional)
	if (objects.channels != null && objects.channels.length > 0) {
		await Promise.all(
			objects.channels.map((c) =>
				extendChannel(deviceId + "." + c.id, c),
			),
		);
	}
	// Ensure the state objects exist. These might change in every advertisement frame
	await Promise.all(
		objects.states.map((s) => extendState(deviceId + "." + s.id, s)),
	);

	// Now fill the states with values
	if (values != null) {
		_.adapter.log.debug(
			`${deviceId} > got values: ${JSON.stringify(values)}`,
		);
		// eslint-disable-next-line prefer-const
		for (let [stateId, value] of entries(values)) {
			// Fix special chars
			stateId = stateId.replace(/[\(\)]+/g, "").replace(" ", "_");
			// set the value if there's an object for the state
			const iobStateId = `${adapter.namespace}.${deviceId}.${stateId}`;
			if ((await _.objectCache.getObject(iobStateId)) != null) {
				_.adapter.log.debug(`setting state ${iobStateId}`);
				await adapter.setStateChangedAsync(
					iobStateId,
					value ?? null,
					true,
				);
			} else {
				_.adapter.log.warn(
					`skipping state ${iobStateId} because the object does not exist`,
				);
			}
		}
	} else {
		_.adapter.log.debug(`${deviceId} > got no values`);
	}
}

function handleScanProcessError(err: Error) {
	if (
		/compatible USB Bluetooth/.test(err.message) ||
		/LIBUSB_ERROR_NOT_SUPPORTED/.test(err.message)
	) {
		terminate("No compatible BLE 4.0 hardware found!");
	} else if (
		/NODE_MODULE_VERSION/.test(err.message) &&
		adapter.supportsFeature?.("CONTROLLER_NPM_AUTO_REBUILD")
	) {
		terminate("A dependency requires a rebuild.", 13);
	} else if (err.message.includes(`The value of "offset" is out of range`)) {
		// ignore, this happens in noble sometimes
		(adapter?.log ?? console).error(err.message);
	} else if (err.message.includes("EAFNOSUPPORT")) {
		terminate(
			"Unsupported Address Family (EAFNOSUPPORT). If ioBroker is running in a Docker container, make sure that the container uses host mode networking.",
		);
	} else {
		// This is something unexpected. We don't want to bring down the main process, so just log it
		(adapter?.log ?? console).error(err.message);
	}
}

function terminate(
	reason: string = "no reason given",
	exitCode: number = 11,
): never {
	if (adapter) {
		adapter.log.error(`Terminating because ${reason}`);
		adapter.terminate?.(reason, exitCode);
	}
	return process.exit(exitCode);
}
