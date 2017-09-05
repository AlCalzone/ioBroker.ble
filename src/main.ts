import { ExtendedAdapter, Global as _ } from "./lib/global";
import * as noble from "noble";
import utils from "./lib/utils";

/** MAC addresses of known devices */
let knownDevices: string[] = [];
let services: string[] = [];

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
	objectChange: (id, obj) => {

	},

	// is called if a subscribed state changes
	stateChange: (id, state) => {

	},

	//// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
	//// requires the property to be configured in io-package.json
	//message: (obj) => {
	//	if (typeof obj === "object" && obj.message) {
	//		if (obj.command === "send") {
	//			// e.g. send email or pushover or whatever
	//			console.log("send command");

	//			// Send response in callback if required
	//			if (obj.callback) adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
	//		}
	//	}
	//},
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
 * Update the state with the given ID or create it if it doesn't exist
 * @param stateId ID of the state to update or create
 * @param value The value to store
 */
async function updateCharacteristic(deviceID: string, characteristic: string, value: any, ack: boolean) {
	// TODO: Check if this is ok
	const stateID = `${deviceID}.${characteristic}`
	const state = await adapter.$getState(stateID);
	if (state == null) {
		await adapter.$createState(deviceID, null, characteristic, {
			"role": "value",
			"name": "BLE characteristic " + characteristic,
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

async function onDiscover(peripheral) {
	if (!(peripheral && peripheral.advertisement && peripheral.advertisement.serviceData)) return;

	if (knownDevices.indexOf(peripheral.address) === -1) {
		// need to create device first
		await adapter.$createDevice(peripheral.address, {
			name: peripheral.advertisement.localName,
		});
	}
	for (const entry of peripheral.advertisement.serviceData) {
		const uuid = entry.uuid;
		let data = entry.data;
		if (data.type === "Buffer") {
			data = Buffer.from(data.data);
		}
		if (data.length === 1) {
			// single byte
			data = data[0];
		} else if (data instanceof Buffer) {
			// Output hex value
			data = data.toString("hex");
		} else { // not supported yet
			continue;
		}

		updateCharacteristic(peripheral.address, uuid, data, true);
	}
};

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
