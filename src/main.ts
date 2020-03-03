import * as utils from "@iobroker/adapter-core";
import { exec } from "child_process";
import { EventEmitter } from "events";
import { applyCustomObjectSubscriptions, applyCustomStateSubscriptions } from "./lib/custom-subscriptions";
import { Global as _ } from "./lib/global";
import { extendChannel, extendDevice, extendState } from "./lib/iobroker-objects";
import { ObjectCache } from "./lib/object-cache";

// Load all registered plugins
import plugins from "./plugins";
import { Plugin } from "./plugins/plugin";

let enabledPlugins: Plugin[];
let services: string[] = [];

/** Whether new devices may be recorded */
let allowNewDevices: boolean = true;
/** Cache of new devices we already ignored */
const ignoredNewDeviceIDs = new Set<string>();

// /** MAC addresses of known devices */
// let knownDevices: string[] = [];

/** How frequent the RSSI of devices should be updated */
let rssiUpdateInterval: number = 0;

/** noble-Treiber-Instanz */
// tslint:disable-next-line:whitespace
let noble: typeof import("noble") & EventEmitter;

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
		const allowNewDevicesState = await adapter.getStateAsync("options.allowNewDevices");
		allowNewDevices = (allowNewDevicesState && allowNewDevicesState.val != undefined) ? allowNewDevicesState.val : true;
		await adapter.setStateAsync("options.allowNewDevices", allowNewDevices, true);

		// Plugins laden
		_.log(`loaded plugins: ${plugins.map(p => p.name).join(", ")}`);
		const enabledPluginNames: string[] = (adapter.config.plugins as string || "")
			.split(",")
			.map((p: string) => p.trim().toLowerCase())
			.concat("_default")
			;
		enabledPlugins = plugins.filter(p => enabledPluginNames.indexOf(p.name.toLowerCase()) > -1);
		_.log(`enabled plugins: ${enabledPlugins.map(p => p.name).join(", ")}`);

		// Bring the monitored service names into the correct form
		if (adapter.config.services === "*") {
			services = [];
			_.log(`monitoring all services`);
		} else {
			services =
				(adapter.config.services as string).split(",")	// get manually defined services
					.concat(...enabledPlugins.map(p => p.advertisedServices))	// concat with plugin-defined ones
					.reduce((acc, s) => acc.concat(s), [] as string[])		// flatten the arrays
					.map(s => fixServiceName(s))				// cleanup the names
					.filter(s => s !== "")
					.reduce((acc: any[], s) => {				// filter out duplicates
						if (acc.indexOf(s) === -1) acc.push(s);
						return acc;
					}, [])
				;
			_.log(`monitored services: ${services.join(", ")}`);
		}

		// Limit RSSI updates
		if (adapter.config.rssiThrottle != null) {
			rssiUpdateInterval = Math.max(0, Math.min(10000, adapter.config.rssiThrottle));
		}
		// monitor our own states and objects
		adapter.subscribeStates("*");
		adapter.subscribeObjects("*");

		if (!process.env.TESTING) {
			// load noble driver with the correct device selected
			// but only if this is not a testing environment
			process.env.NOBLE_HCI_DEVICE_ID = (adapter.config.hciDevice || 0).toString();
			try {
				noble = require("@abandonware/noble");
			} catch (e) {
				tryCatchUnsupportedHardware(e, () => {
					terminate(e.message || e);
				});
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
				adapter.setState("info.driverState", state, true);
			});
			if (noble.state === "poweredOn") startScanning();
			adapter.setState("info.driverState", noble.state, true);
		}
	},

	// is called when adapter shuts down - callback has to be called under any circumstances!
	unload: (callback) => {
		try {
			stopScanning();
			noble.removeAllListeners("stateChange");
			callback();
		} catch (e) {
			callback();
		}
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
		// apply additional subscriptions we've defined
		applyCustomObjectSubscriptions(id, obj);
	},

	// is called if a subscribed state changes
	stateChange: (id, state) => {
		if (/options\.allowNewDevices$/.test(id) && state != undefined && !state.ack) {
			if (typeof state.val === "boolean") {
				allowNewDevices = state.val;
				// ACK the state change
				_.adapter.setState(id, state.val, true);
				// Whenever allowNewDevices is set to true,
				// forget all devices we previously ignored
				if (allowNewDevices) ignoredNewDeviceIDs.clear();
			}
		}
		// apply additional subscriptions we've defined
		applyCustomStateSubscriptions(id, state);
	},

	message: async (obj) => {
		// responds to the adapter that sent the original message
		function respond(response) {
			if (obj.callback) adapter.sendTo(obj.from, obj.command, response, obj.callback);
		}
		// some predefined responses so we only have to define them once
		const predefinedResponses = {
			ACK: { error: null },
			OK: { error: null, result: "ok" },
			ERROR_UNKNOWN_COMMAND: { error: "Unknown command!" },
			MISSING_PARAMETER: (paramName) => {
				return { error: 'missing parameter "' + paramName + '"!' };
			},
			COMMAND_RUNNING: { error: "command running" },
		};
		// make required parameters easier
		function requireParams(params) {
			if (!(params && params.length)) return true;
			for (const param of params) {
				if (!(obj.message && obj.message.hasOwnProperty(param))) {
					respond(predefinedResponses.MISSING_PARAMETER(param));
					return false;
				}
			}
			return true;
		}

		// handle the message
		if (obj) {
			switch (obj.command) {
				case "getHCIPorts":
					exec("hciconfig | grep hci", (error, stdout, stderr) => {
						// hci1:   Type: BR/EDR  Bus: USB
						// hci0:   Type: BR/EDR  Bus: UART
						if (error != null) {
							_.log(JSON.stringify(error));
							respond({ error });
							return;
						}
						// parse index and bus type
						const ports: { index: number, bus: string }[] = [];
						const regex = /^hci(\d+)\:.+Bus\:\s(\w+)$/gm;
						let result: RegExpExecArray | null;

						while (true) {
							result = regex.exec(stdout);
							if (!(result && result.length)) break;
							const port = { index: +result[1], bus: result[2] };
							_.log(JSON.stringify(port));
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

// =========================

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

async function onDiscover(peripheral: BLE.Peripheral) {

	if (peripheral == null) return;

	let serviceDataIsNotEmpty = false;
	let manufacturerDataIsNotEmpty = false;

	_.log(`discovered peripheral ${peripheral.address}`, "debug");
	_.log(`  has advertisement: ${peripheral.advertisement != null}`, "debug");
	if (peripheral.advertisement != null) {
		_.log(`  has serviceData: ${peripheral.advertisement.serviceData != null}`, "debug");
		if (peripheral.advertisement.serviceData != null) {
			_.log(`  serviceData = ${JSON.stringify(peripheral.advertisement.serviceData)}`, "debug");
			serviceDataIsNotEmpty = peripheral.advertisement.serviceData.length > 0;
		}
		_.log(`  has manufacturerData: ${peripheral.advertisement.manufacturerData != null}`, "debug");
		if (peripheral.advertisement.manufacturerData != null) {
			_.log(`  manufacturerData = ${peripheral.advertisement.manufacturerData.toString("hex")}`, "debug");
			manufacturerDataIsNotEmpty = peripheral.advertisement.manufacturerData.length > 0;
		}
	} else {
		// don't create devices for peripherals without advertised data
		return;
	}
	// create devices if we selected to allow empty devices
	// or the peripheral transmits serviceData or manufacturerData
	if (!adapter.config.allowEmptyDevices && !serviceDataIsNotEmpty && !manufacturerDataIsNotEmpty) {
		return;
	}

	const deviceId = peripheral.address;

	// find out which plugin is handling this
	let plugin: Plugin | undefined;
	for (const p of enabledPlugins) {
		if (p.isHandling(peripheral)) {
			_.log(`plugin ${p.name} is handling ${deviceId}`, "debug");
			plugin = p;
			break;
		}
	}
	if (!plugin) {
		_.log(`no handling plugin found for peripheral ${peripheral.id}`, "warn");
		return;
	}

	// Test if we may record this device
	if (!allowNewDevices) {
		// We may not. First test if we already ignored this device
		if (ignoredNewDeviceIDs.has(deviceId)) return;
		// If not, check if the RSSI object exists, as that exists for every one
		if (!await _.objectCache.objectExists(`${_.adapter.namespace}.${deviceId}.rssi`)) {
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
		(rssiState.val !== peripheral.rssi &&			// only save changes
			rssiState.lc + rssiUpdateInterval < Date.now())	// and dont update too frequently
	) {
		_.log(`updating rssi state for ${deviceId}`, "debug");
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
			objects.channels.map(
				c => extendChannel(deviceId + "." + c.id, c),
			),
		);
	}
	// Ensure the state objects exist. These might change in every advertisement frame
	await Promise.all(
		objects.states.map(
			s => extendState(deviceId + "." + s.id, s),
		),
	);

	// Now fill the states with values
	if (values != null) {
		_.log(`${deviceId} > got values: ${JSON.stringify(values)}`, "debug");
		for (let stateId of Object.keys(values)) {
			// Fix special chars
			stateId = stateId.replace(/[\(\)]+/g, "").replace(" ", "_");
			// set the value if there's an object for the state
			const iobStateId = `${adapter.namespace}.${deviceId}.${stateId}`;
			if (await _.objectCache.getObject(iobStateId) != null) {
				_.log(`setting state ${iobStateId}`, "debug");
				await adapter.setStateChangedAsync(iobStateId, values[stateId], true);
			} else {
				_.log(`skipping state ${iobStateId} because the object does not exist`, "warn");
			}
		}
	} else {
		_.log(`${deviceId} > got no values`, "debug");
	}

}

let isScanning = false;
function startScanning() {
	if (isScanning) return;
	adapter.setState("info.connection", true, true);
	noble.on("discover", onDiscover);
	_.log(`starting scan for services ${JSON.stringify(services)}`);
	noble.startScanning(services, true);
	isScanning = true;
}
function stopScanning() {
	if (!isScanning) return;
	noble.removeAllListeners("discover");
	_.log(`stopping scan`);
	noble.stopScanning();
	adapter.setState("info.connection", false, true);
	isScanning = false;
}

function tryCatchUnsupportedHardware(err: Error, otherwise: () => never): never {
	if (
		/compatible USB Bluetooth/.test(err.message)
		|| /LIBUSB_ERROR_NOT_SUPPORTED/.test(err.message)
	) {
		terminate("No compatible BLE 4.0 hardware found!");
	} else {
		// ioBroker gives the process time to exit, so we need to call the alternative conditionally
		otherwise();
	}
}

function terminate(reason: string = "no reason given"): never {
	if (adapter) {
		adapter.log.error(`Terminating because ${reason}`);
		if (adapter.terminate) {
			return adapter.terminate(reason);
		}
	}
	return process.exit(11);
}

// wotan-disable no-useless-predicate
process.on("unhandledRejection", r => {
	(adapter?.log ?? console).error("unhandled promise rejection: " + r);
});
process.on("uncaughtException", err => {
	// Noble on Windows seems to throw in a callback we cannot catch
	tryCatchUnsupportedHardware(err, () => {
		(adapter?.log ?? console).error("unhandled exception:" + err.message);
		(adapter?.log ?? console).error("> stack: " + err.stack);
		return process.exit(1);
	});
});
