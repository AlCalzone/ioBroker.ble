import { Plugin, PeripheralObjectStructure, DeviceObjectDefinition, ChannelObjectDefinition, StateObjectDefinition } from "./plugin";
import { Global as _ } from "../lib/global";

function parseData(raw: Buffer): string | number {
	if (raw.length === 1) {
		// single byte
		return raw[0];
	} else {
		// Output hex value
		return raw.toString("hex");
	}
}

const plugin: Plugin = {
	name: "_default",
	description: "Handles all peripherals that are not handled by other plugins",

	// Just handle all services we receive already
	advertisedServices: [],
	isHandling: (p) => true,

	defineObjects: (peripheral: BLE.Peripheral): PeripheralObjectStructure => {

		let deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: null,
			native: null,
		};

		const channelId = `services`;
		let channelObject: ChannelObjectDefinition = {
			id: channelId,
			common: {
				// common
				name: "Advertised services",
				role: "info"
			},
			native: null,
		};

		let stateObjects: StateObjectDefinition[] = [];
		for (const entry of peripheral.advertisement.serviceData) {
			const uuid = entry.uuid;
			const stateId = `services.${uuid}`;

			stateObjects.push({
				id: stateId,
				common: {
					"role": "value",
					"name": "Advertised service " + uuid, // TODO: create readable names
					"desc": "",
					"type": "mixed",
					"read": true,
					"write": false,
				},
				native: null,
			});
		}

		return {
			device: deviceObject,
			channels: [channelObject],
			states: stateObjects,
		};

	},

	getValues: (peripheral: BLE.Peripheral): { [id: string]: any } => {
		let ret: { [id: string]: any } = {};
		for (const entry of peripheral.advertisement.serviceData) {
			const uuid = entry.uuid;
			const stateId = `services.${uuid}`;
			// remember the transmitted data
			ret[stateId] = parseData(entry.data);
		}
		
		return ret;
	}
};

export = plugin;
