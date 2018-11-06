/*!
 * Plugin for Xiaomi devices using the fe95 characteristic
 */

import { entries } from "alcalzone-shared/objects";
import { Global as _ } from "../lib/global";
import { MacPrefixes, XiaomiAdvertisement, XiaomiEvent } from "./lib/xiaomi_protocol";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

interface XiaomiContext {
	event?: XiaomiEvent;
}

function parseAdvertisementEvent(data: Buffer): XiaomiEvent | undefined {
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
	return advertisement.event;
}

const plugin: Plugin<XiaomiContext> = {
	name: "Xiaomi",
	description: "Xiaomi devices",

	advertisedServices: ["fe95"],
	isHandling: (p) => {
		const mac = p.address.toLowerCase();
		if (!Object.keys(MacPrefixes).some(key => mac.startsWith(MacPrefixes[key]))) return false;
		return p.advertisement.serviceData.some(entry => entry.uuid === "fe95");
	},

	createContext: (peripheral: BLE.Peripheral) => {
		const data = getServiceData(peripheral, "fe95");
		if (data == undefined) return;

		_.log(`xiaomi >> got data: ${data.toString("hex")}`, "debug");

		const event = parseAdvertisementEvent(data);
		if (event == undefined) return;

		return { event };
	},

	defineObjects: (context: XiaomiContext) => {

		if (context == undefined || context.event == undefined) return;

		const deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: undefined,
			native: undefined,
		};

		// no channels

		const stateObjects: StateObjectDefinition[] = [];

		const ret = {
			device: deviceObject,
			channels: undefined,
			states: stateObjects,
		};

		const event = context.event;
		if (event != undefined) {
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
					native: undefined,
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
					native: undefined,
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
					native: undefined,
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
					native: undefined,
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
					native: undefined,
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
					native: undefined,
				});
			}
		}

		return ret;

	},
	getValues: (context: XiaomiContext) => {
		if (context == null || context.event == null) return;

		for (const [prop, value] of entries(context.event)) {
			_.log(`xiaomi >> {{green|got ${prop} update => ${value}}}`, "debug");
		}
		// The event is simply the value dictionary itself
		return context.event;
	},
};

export = plugin as Plugin;
