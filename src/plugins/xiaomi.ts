/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */

import { Global as _ } from "../lib/global";
import { entries } from "../lib/object-polyfill";
import { MacPrefixes, XiaomiAdvertisement } from "../lib/xiaomi_protocol";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

const plugin: Plugin = {
	name: "Xiaomi",
	description: "Xiaomi devices",

	advertisedServices: ["fe95"],
	isHandling: (p) => {
		const mac = p.address.toLowerCase();
		if (!Object.keys(MacPrefixes).some(key => mac.startsWith(MacPrefixes[key]))) return false;
		return p.advertisement.serviceData.some(entry => entry.uuid === "fe95");
	},

	defineObjects: (peripheral: BLE.Peripheral): PeripheralObjectStructure => {

		const deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: null,
			native: null,
		};

		// no channels

		const stateObjects: StateObjectDefinition[] = [];

		const ret = {
			device: deviceObject,
			channels: null,
			states: stateObjects,
		};

		const data: Buffer = getServiceData(peripheral, "fe95");
		let advertisement: XiaomiAdvertisement;
		if (data != null) {
			// try to parse the data
			try {
				advertisement = new XiaomiAdvertisement(data);
			} catch (e) { /* okee */ }
		}
		if (advertisement != null && advertisement.hasEvent) {
			const event = advertisement.event;
			if ("temperature" in event) {
				stateObjects.push({
					id: "temperature",
					common: {
						role: "value",
						name: "Temperature",
						type: "number",
						unit: "°C",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("humidity" in event) {
				stateObjects.push({
					id: "humidity",
					common: {
						role: "value",
						name: "Relative Humidity",
						type: "number",
						unit: "%rF",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("illuminance" in event) {
				stateObjects.push({
					id: "illuminance",
					common: {
						role: "value",
						name: "Illuminance",
						type: "number",
						unit: "lux",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("moisture" in event) {
				stateObjects.push({
					id: "moisture",
					common: {
						role: "value",
						name: "Moisture",
						desc: "Moisture of the soil",
						type: "number",
						unit: "%",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("fertility" in event) {
				stateObjects.push({
					id: "fertility",
					common: {
						role: "value",
						name: "Fertility",
						desc: "Fertility of the soil",
						type: "number",
						unit: "µS/cm",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("battery" in event) {
				stateObjects.push({
					id: "battery",
					common: {
						role: "value",
						name: "Battery",
						desc: "Battery status of the sensor",
						type: "number",
						unit: "%",
						read: true,
						write: false,
					},
					native: null,
				});
			}
		}

		return ret;

	},
	getValues: (peripheral: BLE.Peripheral): Record<string, any> => {
		const data: Buffer = getServiceData(peripheral, "fe95");
		if (data == null) return;

		_.log(`xiaomi >> got data: ${data.toString("hex")}`, "debug");

		// try to parse the data
		let advertisement: XiaomiAdvertisement;
		try {
			advertisement = new XiaomiAdvertisement(data);
		} catch (e) {
			_.log(`xiaomi >> failed to parse data`, "debug");
			return;
		}

		if (!advertisement.hasEvent || advertisement.isBindingFrame) {
			_.log(`xiaomi >> The device is not fully initialized.`, "debug");
			_.log(`xiaomi >> Use its app to complete the initialization.`, "debug");
			return;
		}

		// succesful - return it
		for (const [prop, value] of entries(advertisement.event)) {
			_.log(`xiaomi >> {{green|got ${prop} update => ${value}}}`, "debug");
		}
		return advertisement.event;
	},
};

export = plugin;
