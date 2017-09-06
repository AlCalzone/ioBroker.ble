import { ExtendedAdapter, Global as _ } from "./lib/global";
import utils from "./lib/utils";
import { exec } from "child_process";

/** MAC addresses of known devices */
let knownDevices: string[] = [];
let services: string[] = [];

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

		// Bring the monitored service names into the correct form
		services = adapter.config.services
			.split(",")
			.map(s => fixServiceName(s))
			.filter(s => s != null)
			;

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
			if (obj.callback)
				adapter.sendTo(obj.from, obj.command, response, obj.callback);
		}
		// some predefined responses so we only have to define them once
		var predefinedResponses = {
			ACK: { error: null },
			OK: { error: null, result: 'ok' },
			ERROR_UNKNOWN_COMMAND: { error: 'Unknown command!' },
			MISSING_PARAMETER: function (paramName) {
				return { error: 'missing parameter "' + paramName + '"!' };
			},
			COMMAND_RUNNING: { error: 'command running' }
		};
		// make required parameters easier
		function requireParams(params) {
			if (!(params && params.length)) return true;
			for (var i = 0; i < params.length; i++) {
				if (!(obj.message && obj.message.hasOwnProperty(params[i]))) {
					respond(predefinedResponses.MISSING_PARAMETER(params[i]));
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
						//hci1:   Type: BR/EDR  Bus: USB
						//hci0:   Type: BR/EDR  Bus: UART
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
	// No whitespace
	for (const char of ["\r", "\n", "\t", " "]) {
		name = name.replace(char, "");
	}
	// No leading 0x
	name = name.replace(/^0x/, "");
	// lowerCase
	return name.toLowerCase();
}

/**
 * Update or create the stored service data for a given device and UUID
 * @param stateId ID of the state to update or create
 * @param uuid GATT UUID of the advertised service data
 * @param value The value to store
 */
async function updateAdvertisement(deviceID: string, uuid: string, value: any, ack: boolean) {
	const stateID = `${deviceID}.services.${uuid}`;
	const state = await adapter.$getState(stateID);
	if (state == null) {
		await adapter.$createState(deviceID, "services", uuid, {
			"role": "value",
			"name": "Advertised service " + uuid, // TODO: create readable names
			"desc": "",
			"type": "mixed",
			"read": true,
			"write": false,
			"def": value
		});
	} else {
		await adapter.$setStateChanged(stateID, value, ack);
	}
}

async function onDiscover(peripheral: BLE.Peripheral) {
	if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData)) return;

	const deviceName: string = peripheral.address;

	if (knownDevices.indexOf(deviceName) === -1) {
		// need to create device first
		await adapter.$createDevice(deviceName, {
			// common
			name: peripheral.advertisement.localName,
		}, { 
			// native
			id: peripheral.id,
			address: peripheral.address,
			addressType: peripheral.addressType,
			connectable: peripheral.connectable
		});
		// also create channels for information
		await adapter.$createChannel(deviceName, "services", {
			// common
			name: "Advertised services",
			role: "info"
		});
		// TODO: Enable this when supported
		// await adapter.$createChannel(deviceName, "characteristics", {
		// 	// common
		// 	name: "Characteristics",
		// 	role: "info"
		// });
		await adapter.$createState(deviceName, null, "rssi", {
			"role": "indicator",
			"name": "signal strength (RSSI)",
			"desc": "Signal strength of the device",
			"type": "number",
			"read": true,
			"write": false
		});

		knownDevices.push(deviceName);
	}
	// update RSSI information
	await adapter.$setStateChanged(`${deviceName}.rssi`, peripheral.rssi, true);
	// update service information
	for (const entry of peripheral.advertisement.serviceData) {
		const uuid = entry.uuid;
		// parse the data
		let data: Buffer | string | number = entry.data;
		if (data.length === 1) {
			// single byte
			data = data[0];
		} else if (data instanceof Buffer) {
			// Output hex value
			data = data.toString("hex");
		} else { // not supported yet
			continue;
		}
		// and store it
		updateAdvertisement(deviceName, uuid, data, true);
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