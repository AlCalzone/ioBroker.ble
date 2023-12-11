import { Global as _ } from "../lib/global";
import {
	BTHomeAdvertisement,
	type BTHomeBinarySensorData,
	type BTHomeEvent,
	type BTHomeMultilevelSensorData,
	type SpecialSensors,
} from "./lib/bthome_protocol";
import {
	getServiceData,
	type DeviceObjectDefinition,
	type Plugin,
	type StateObjectDefinition,
} from "./plugin";

interface BTHomeContext {
	readonly packetId?: number;
	readonly multilevelSensors: readonly BTHomeMultilevelSensorData[];
	readonly binarySensors: readonly BTHomeBinarySensorData[];
	readonly specialSensors: readonly SpecialSensors[];
	readonly events: readonly BTHomeEvent[];
}

function parseAdvertisement(data: Buffer): BTHomeAdvertisement | undefined {
	// try to parse the data
	let advertisement: BTHomeAdvertisement;
	try {
		advertisement = new BTHomeAdvertisement(data);
	} catch (e) {
		_.adapter.log.debug(`bthome >> failed to parse data`);
		return;
	}

	// succesful - return it
	return advertisement;
}

const plugin: Plugin<BTHomeContext> = {
	name: "BTHome",
	description: "BTHome devices",

	advertisedServices: ["fcd2"],
	isHandling: (p) => {
		return p.advertisement?.serviceData?.some(
			(entry) => entry.uuid === "fcd2",
		);
	},

	createContext: (peripheral) => {
		const data = getServiceData(peripheral, "fcd2");
		if (data == undefined) return;

		_.adapter.log.debug(`bthome >> got data: ${data.toString("hex")}`);

		const advertisement = parseAdvertisement(data);
		if (!advertisement) return;

		return {
			packetId: advertisement.packetId,
			multilevelSensors: advertisement.multilevelSensors,
			binarySensors: advertisement.binarySensors,
			specialSensors: advertisement.specialSensors,
			events: advertisement.events,
		};
	},

	defineObjects: (context) => {
		if (context == undefined) return;

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

		const duplicates = new Map<string, number>();

		for (const ms of context.multilevelSensors) {
			const id = ms.label.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateObject: StateObjectDefinition = {
				id: id + (count > 1 ? `_${count + 1}` : ""),
				common: {
					name: ms.label + (count > 1 ? ` (${count + 1})` : ""),
					read: true,
					write: false,
					type: "number",
					role: "value",
					unit: ms.unit,
				},
				native: undefined,
			};
			stateObjects.push(stateObject);
		}

		for (const bs of context.binarySensors) {
			const id = bs.label.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateObject: StateObjectDefinition = {
				id: id + (count > 1 ? `_${count + 1}` : ""),
				common: {
					name: bs.label + (count > 1 ? ` (${count + 1})` : ""),
					read: true,
					write: false,
					type: "boolean",
					role: "indicator",
					states: bs.states,
				},
				native: undefined,
			};
			stateObjects.push(stateObject);
		}

		// TODO: Events and special sensors

		return ret;
	},

	getValues: (context) => {
		if (context == undefined) return;

		const duplicates = new Map<string, number>();
		const ret: Record<string, any> = {};

		for (const ms of context.multilevelSensors) {
			const id = ms.label.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateId = id + (count > 1 ? `_${count + 1}` : "");
			ret[stateId] = ms.value;
		}

		for (const bs of context.binarySensors) {
			const id = bs.label.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateId = id + (count > 1 ? `_${count + 1}` : "");
			ret[stateId] = bs.value;
		}

		// TODO: Events and special sensors

		return ret;
	},
};

export = plugin as Plugin;
