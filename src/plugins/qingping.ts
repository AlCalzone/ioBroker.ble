import {
	QingpingAdvertisement,
	type QingpingEvent,
} from "./lib/qingping_protocol";
import { Global as _ } from "../lib/global";
import type { PeripheralInfo } from "../lib/scanProcessInterface";
import {
	getServiceData,
	type ChannelObjectDefinition,
	type DeviceObjectDefinition,
	type PeripheralObjectStructure,
	type Plugin,
	type StateObjectDefinition,
} from "./plugin";

interface QingpingContext {
	event?: QingpingEvent;
}

function parseData(raw: Buffer): string | number {
	if (raw.length === 1) {
		// single byte
		return raw[0];
	} else {
		// Output hex value
		return raw.toString("hex");
	}
}

function parseAdvertisementEvent(data: Buffer): QingpingEvent | undefined {
	// try to parse the data
	let advertisement: QingpingAdvertisement;
	try {
		advertisement = new QingpingAdvertisement(data);
	} catch (e) {
		_.adapter.log.debug(`qingping >> failed to parse data`);
		return;
	}

	return advertisement.event;
}

// remember tested peripherals by their MAC address for 1h
const testValidity = 1000 * 3600;
const testedPeripherals = new Map<
	string,
	{ timestamp: number; result: boolean }
>();

const plugin: Plugin<QingpingContext> = {
	name: "Qingping",
	description: "Handles Qingping temperature and humidity sensors",

	// Just handle all services we receive already
	advertisedServices: [],
	isHandling: (p) => {
		if (
			!p.advertisement ||
			!p.advertisement.serviceData ||
			!p.advertisement.serviceData.some((entry) => entry.uuid === "fdcd")
		)
			return false;
		const mac = p.address.toLowerCase();
		const cached = testedPeripherals.get(mac);
		if (cached && cached.timestamp >= Date.now() - testValidity) {
			// we have a recent test result, return it
			return cached.result;
		}
		// Try to parse advertisement data as a XiaomiEvent to see if this
		// is for us
		let ret = false;
		const data = getServiceData(p, "fdcd");
		if (data != undefined) {
			const event = parseAdvertisementEvent(data);
			ret = event != undefined;
		}
		// store the test result
		testedPeripherals.set(mac, {
			timestamp: Date.now(),
			result: ret,
		});
		return ret;
	},

	// No special context necessary. Return the peripheral, so it gets passed to the other methods.
	createContext: (peripheral: PeripheralInfo) => {
		const data = getServiceData(peripheral, "fdcd");
		if (data == undefined) return;

		_.adapter.log.debug(`qingping >> got data: ${data.toString("hex")}`);

		const event = parseAdvertisementEvent(data);
		if (event == undefined) return;

		return { event };
	},

	defineObjects: (context: QingpingContext) => {
		if (context == undefined || context.event == undefined) return;

		const deviceObject: DeviceObjectDefinition = {
			// no special definitions neccessary
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
		return ret;
	},

	getValues: (context: QingpingContext) => {
		if (context == null || context.event == null) return;

		// The event is simply the value dictionary itself
		return context.event;
	},
};

export = plugin;
