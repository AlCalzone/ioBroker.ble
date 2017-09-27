import { exec } from "child_process";
import { ExtendedAdapter, Global as _ } from "./lib/global";
import utils from "./lib/utils";

// Load all registered plugins
import plugins from "./plugins";
import { Plugin } from "./plugins/plugin";
let enabledPlugins: Plugin[];
let services: string[] = [];

/** MAC addresses of known devices */
let knownDevices: string[] = [];

// noble-Treiber-Instanz
let noble;

// Adapter-Objekt erstellen
let adapter: ExtendedAdapter = utils.adapter({
	name: "ble",

	// is called when databases are connected and adapter received configuration.
	// start here!
	ready: async () => {

		// Adapter-Instanz global machen
		adapter = _.extend(adapter);
		_.adapter = adapter;

		// Workaround für fehlende InstanceObjects nach update
		await _.ensureInstanceObjects();

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
		services =
			(adapter.config.services as string).split(",")	// get manually defined services
				.concat(...plugins.map(p => p.advertisedServices))	// concat with plugin-defined ones
				.reduce((acc, s) => acc.concat(s), [])		// flatten the arrays
				.map(s => fixServiceName(s))				// cleanup the names
				.filter(s => s != null && s !== "")
				.reduce((acc: any[], s) => {				// filter out duplicates
					if (acc.indexOf(s) === -1) acc.push(s);
					return acc;
				}, [])
			;
		_.log(`monitored services: ${services.join(", ")}`);

		adapter.subscribeStates("*");
		adapter.subscribeObjects("*");

		// Find all known devices
		knownDevices = Object.keys(
			await _.$$(`${adapter.namespace}.*`, "device"),
		);

		// load noble driver with the correct device selected
		process.env.NOBLE_HCI_DEVICE_ID = adapter.config.hciDevice || 0;
		noble = require("noble");

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
	objectChange: (id, obj) => { /* TODO */ },

	// is called if a subscribed state changes
	stateChange: (id, state) => { /* TODO */ },

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
						let result: RegExpExecArray;

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

}) as ExtendedAdapter;

// =========================

function fixServiceName(name: string): string {
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
	if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData && peripheral.advertisement.serviceData.length > 0)) return;

	// find out which plugin is handling this
	let plugin: Plugin;
	for (const p of enabledPlugins) {
		if (p.isHandling(peripheral)) {
			plugin = p;
			break;
		}
	}
	if (!plugin) {
		_.log(`no handling plugin found for peripheral ${peripheral.id}`, "warn");
		return;
	}

	const deviceId = peripheral.address;

	// if this peripheral is unknown, create the objects
	if (knownDevices.indexOf(deviceId) === -1) {
		const objects = plugin.defineObjects(peripheral);

		// create the device object
		await adapter.$setObject(deviceId, {
			type: "device",
			common: Object.assign(
				{
					name: peripheral.advertisement.localName,
				},
				objects.device.common || {},
			),
			native: Object.assign(
				{
					id: peripheral.id,
					address: peripheral.address,
					addressType: peripheral.addressType,
					connectable: peripheral.connectable,
				},
				objects.device.native || {},
			),
		});
		// create all channel objects
		if (objects.channels != null && objects.channels.length > 0) { // channels are optional
			await Promise.all(
				objects.channels.map((c) => {
					return adapter.$setObject(deviceId + "." + c.id, {
						type: "channel",
						common: c.common,
						native: c.native || {},
					});
				}),
			);
		}
		// create all state objects
		await Promise.all(
			objects.states.map((s) => {
				return adapter.$setObject(deviceId + "." + s.id, {
					type: "state",
					common: s.common,
					native: s.native || {},
				});
			}),
		);
		// also create device information states
		await adapter.$setObject(`${deviceId}.rssi`, {
			type: "device",
			common: {
				role: "indicator",
				name: "signal strength (RSSI)",
				desc: "Signal strength of the device",
				type: "number",
				read: true,
				write: false,
			},
			native: {},
		});

		knownDevices.push(deviceId);
	}
	// update RSSI information
	await adapter.$setStateChanged(`${deviceId}.rssi`, peripheral.rssi, true);

	// get values from plugin
	const values = plugin.getValues(peripheral);
	_.log(`${deviceId} > got values: ${JSON.stringify(values)}`, "debug");
	for (const stateId of Object.keys(values)) {
		// set the value if there's an object for the state
		const iobStateId = `${adapter.namespace}.${deviceId}.${stateId}`;
		if (await adapter.$getObject(iobStateId) != null) {
			_.log(`setting state ${iobStateId}`, "debug");
			await adapter.$setStateChanged(iobStateId, values[stateId], true);
		} else {
			_.log(`skipping state ${iobStateId}`, "debug");
		}
	}
}

let isScanning = false;
function startScanning() {
	if (isScanning) return;
	adapter.setState("info.connection", true, true);
	noble.on("discover", onDiscover);
	noble.startScanning(services, true);
	isScanning = true;
}
function stopScanning() {
	if (!isScanning) return;
	noble.removeAllListeners("discover");
	noble.stopScanning();
	adapter.setState("info.connection", false, true);
	isScanning = false;
}

// Unbehandelte Fehler tracen
process.on("unhandledRejection", r => {
	adapter.log.error("unhandled promise rejection: " + r);
});
process.on("uncaughtException", err => {
	adapter.log.error("unhandled exception:" + err.message);
	adapter.log.error("> stack: " + err.stack);
	process.exit(1);
});
