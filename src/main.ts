// you have to require the utils module and call adapter function
import * as noble from "noble";
import utils from "./lib/utils";

let services: string[] = [];

const adapter = utils.adapter({
	name: "template-ts",

	// is called when databases are connected and adapter received configuration.
	// start here!
	ready: () => {

		// TODO: Make extended adapter

		// Bring the monitored service names into the correct form
		services = adapter.config.services
			.split(",")
			.map(s => fixServiceName(s))
			.filter(s => s != null)
			;

		adapter.subscribeStates("*");
		adapter.subscribeObjects("*");

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
		});
		if (noble.state === "poweredOn") startScanning();
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
		// Warning, obj can be null if it was deleted
		adapter.log.info("objectChange " + id + " " + JSON.stringify(obj));
	},

	// is called if a subscribed state changes
	stateChange: (id, state) => {
		// Warning, state can be null if it was deleted
		adapter.log.info("stateChange " + id + " " + JSON.stringify(state));

		// you can use the ack flag to detect if it is status (true) or command (false)
		if (state && !state.ack) {
			adapter.log.info("ack is not set!");
		}
	},

	// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
	// requires the property to be configured in io-package.json
	message: (obj) => {
		if (typeof obj === "object" && obj.message) {
			if (obj.command === "send") {
				// e.g. send email or pushover or whatever
				console.log("send command");

				// Send response in callback if required
				if (obj.callback) adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
			}
		}
	},
});

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
async function updateState(stateId, value, ack) {
	// TODO: Check if this is ok
	const val = (await adapter.$getState(stateId)).val;
	if (val == null) {
		await adapter.$createState(stateId, value);
	} else {
		await adapter.$setStateChanged(stateId, value, ack);
	}
}

const onDiscover = (p) => {
	// TODO: create better object structures
	if (!(p && p.advertisement && p.advertisement.serviceData)) return;
	const stateId_name = `BLE.${p.address}.name`;
	createState(`BLE.${p.address}.name`, p.advertisement.localName);
	for (const entry of p.advertisement.serviceData) {
		const uuid = entry.uuid;
		let data = entry.data;
		if (data.type === "Buffer") {
			data = Buffer.from(data.data);
		}
		if (data.length === 1) {
			// single byte
			data = data[0];
		} else { // not supported yet
			continue;
		}

		updateState(`BLE.${p.address}.${uuid}`, data, true);
	}
};

let isScanning = false;
function startScanning() {
	if (isScanning) return;
	noble.on("discover", onDiscover);
	noble.startScanning(services, true);
	isScanning = true;
}
function stopScanning() {
	if (!isScanning) return;
	noble.removeAllListeners("discover");
	noble.stopScanning();
	isScanning = false;
}
