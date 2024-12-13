import { QingpingAdvertisement } from "./lib/qingping_protocol";
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

function parseData(raw: Buffer): string | number {
	if (raw.length === 1) {
		// single byte
		return raw[0];
	} else {
		// Output hex value
		return raw.toString("hex");
	}
}

function parseAdvertisementEvent(
	data: Buffer,
): QingpingAdvertisement | undefined {
	// try to parse the data
	let advertisement: QingpingAdvertisement;
	try {
		advertisement = new QingpingAdvertisement(data);
	} catch (e) {
		_.adapter.log.debug(`qingping >> failed to parse data`);
		return;
	}

	return advertisement;
}

// remember tested peripherals by their MAC address for 1h
const testValidity = 1000 * 3600;
const testedPeripherals = new Map<
	string,
	{ timestamp: number; result: boolean }
>();

const plugin: Plugin = {
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
	createContext: (peripheral: PeripheralInfo) => peripheral,

	defineObjects: (peripheral: PeripheralInfo): PeripheralObjectStructure => {
		const deviceObject: DeviceObjectDefinition = {
			// no special definitions neccessary
			common: undefined,
			native: undefined,
		};

		const channelId = `services`;
		const channelObject: ChannelObjectDefinition = {
			id: channelId,
			common: {
				// common
				name: "Advertised services",
				role: "info",
			},
			native: undefined,
		};

		const stateObjects: StateObjectDefinition[] = [];
		if (peripheral.advertisement && peripheral.advertisement.serviceData) {
			for (const entry of peripheral.advertisement.serviceData) {
				const uuid = entry.uuid;
				const stateId = `${channelId}.${uuid}`;

				stateObjects.push({
					id: stateId,
					common: {
						role: "value",
						name: "Advertised service " + uuid, // TODO: create readable names
						desc: "",
						type: "mixed",
						read: true,
						write: false,
					},
					native: undefined,
				});
			}
		}
		if (
			peripheral.advertisement &&
			peripheral.advertisement.manufacturerData &&
			peripheral.advertisement.manufacturerData.length > 0
		) {
			stateObjects.push({
				id: `${channelId}.manufacturerData`,
				common: {
					role: "value",
					name: "Manufacturer Data",
					desc: "",
					type: "mixed",
					read: true,
					write: false,
				},
				native: undefined,
			});
		}

		return {
			device: deviceObject,
			channels: [channelObject],
			states: stateObjects,
		};
	},

	getValues: (peripheral: PeripheralInfo) => {
		const ret: Record<string, any> = {};
		if (peripheral.advertisement && peripheral.advertisement.serviceData) {
			for (const entry of peripheral.advertisement.serviceData) {
				const uuid = entry.uuid;
				const stateId = `services.${uuid}`;
				// remember the transmitted data
				ret[stateId] = parseData(entry.data);
				_.adapter.log.debug(
					`_default: ${peripheral.address} > got data ${ret[stateId]} for ${uuid}`,
				);
			}
		}
		if (
			peripheral.advertisement &&
			peripheral.advertisement.manufacturerData &&
			peripheral.advertisement.manufacturerData.length > 0
		) {
			const stateId = `services.manufacturerData`;
			// remember the transmitted data
			ret[stateId] = parseData(peripheral.advertisement.manufacturerData);
			_.adapter.log.debug(
				`_default: ${peripheral.address} > got manufacturer data ${ret[stateId]}`,
			);
		}
		return ret;
	},
};

export = plugin;
