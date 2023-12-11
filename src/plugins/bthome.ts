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
			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			const stateName = ms.label + (count > 0 ? ` (${count + 1})` : "");

			const stateObject: StateObjectDefinition = {
				id: stateId,
				common: {
					name: stateName,
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
			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			const stateName = bs.label + (count > 0 ? ` (${count + 1})` : "");

			const stateObject: StateObjectDefinition = {
				id: stateId,
				common: {
					name: stateName,
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

		for (const ss of context.specialSensors) {
			const id = ss.type.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);
			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			const stateName = ss.type + (count > 0 ? ` (${count + 1})` : "");

			if (ss.type === "text" || ss.type === "raw") {
				const stateObject: StateObjectDefinition = {
					id: stateId,
					common: {
						name: stateName,
						read: true,
						write: false,
						type: "string",
						role: "text",
					},
					native: undefined,
				};
				stateObjects.push(stateObject);
			} else if (ss.type === "timestamp") {
				const stateObject: StateObjectDefinition = {
					id: stateId,
					common: {
						name: stateName,
						read: true,
						write: false,
						type: "number",
						role: "value.time",
					},
					native: undefined,
				};
				stateObjects.push(stateObject);
			}
		}

		for (const evt of context.events) {
			const id = evt.type.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);
			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			const stateName = evt.type + (count > 0 ? ` (${count + 1})` : "");

			if (evt.type === "button") {
				const stateObject: StateObjectDefinition = {
					id: stateId,
					common: {
						name: stateName,
						read: true,
						write: false,
						type: "string",
						role: "text",
					},
					native: undefined,
				};
				stateObjects.push(stateObject);
			} else if (evt.type === "dimmer") {
				stateObjects.push(
					{
						id: stateId,
						common: {
							name: stateName,
							read: true,
							write: false,
							type: "string",
							role: "text",
						},
						native: undefined,
					},
					{
						id: stateId + "_steps",
						common: {
							name: stateName + " steps",
							read: true,
							write: false,
							type: "number",
							role: "value",
						},
						native: undefined,
					},
				);
			}
		}

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

			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			ret[stateId] = ms.value;
		}

		for (const bs of context.binarySensors) {
			const id = bs.label.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			ret[stateId] = bs.value;
		}

		for (const ss of context.specialSensors) {
			const id = ss.type.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);

			const stateId = id + (count > 0 ? `_${count + 1}` : "");
			if (ss.type === "text") {
				ret[stateId] = ss.value;
			} else if (ss.type === "raw") {
				ret[stateId] = ss.value.toString("hex");
			} else if (ss.type === "timestamp") {
				ret[stateId] = ss.value.getTime();
			}
		}

		for (const evt of context.events) {
			const id = evt.type.toLowerCase();
			const count = duplicates.get(id) ?? 0;
			duplicates.set(id, count + 1);
			const stateId = id + (count > 0 ? `_${count + 1}` : "");

			ret[stateId] = evt.event ?? null;
			if (evt.type === "dimmer") {
				ret[stateId + "_steps"] = evt.event?.steps ?? null;
			}
		}

		return ret;
	},
};

export = plugin as Plugin;
