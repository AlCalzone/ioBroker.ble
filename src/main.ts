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
 * Update or create the stored service data for a given device and UUID
 * @param stateId ID of the state to update or create
 * @param uuid GATT UUID of the advertised service data
 * @param value The value to store
 */
async function updateAdvertisement(deviceID: string, uuid: string, value: any, ack: boolean) {
	// TODO: Check if this is ok
	const stateID = `${deviceID}.${uuid}`;
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
	}
	// update RSSI information
	await adapter.$setStateChanged(`${deviceName}.rssi`, peripheral.rssi, true);
	// update service information
	for (const entry of peripheral.advertisement.serviceData) {
		const uuid = entry.uuid;
		// parse the data
		let data: Buffer | number | string;
		if (entry.data.type === "Buffer") {
			data = Buffer.from(entry.data.data);
		} else {
			_.log(`data type not supported: ${entry.data.type}`, {severity: _.severity.warn});
			continue;
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
		// and store it
		updateAdvertisement(deviceName, uuid, data, true);
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
