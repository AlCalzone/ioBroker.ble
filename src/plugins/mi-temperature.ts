import { Global as _ } from "../lib/global";
import { ChannelObjectDefinition, DeviceObjectDefinition, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

const enum FRAME_CONTROL {
	MAC_INCLUDE = 0b10000,
	CAPABILITY_INCLUDE = 0b100000,
	EVENT_INCLUDE = 0b1000000,
}

type DataParser = (buffer: Buffer, offset: number) => Record<string, number>;

const eventParsers: Record<string, DataParser> = {
	4106: (buffer, offset) => ({ bat: buffer.readUInt8(offset) }), // BATTERY
	4109: (buffer, offset) => ({
		tmp: buffer.readUInt16LE(offset) / 10,
		hum: buffer.readUInt16LE(offset + 2) / 10,
	}), // TEMP_HUM
	4102: (buffer, offset) => ({ hum: buffer.readUInt16LE(offset) / 10 }), // HUM
	4100: (buffer, offset) => ({ tmp: buffer.readUInt16LE(offset) / 10 }), // TEMP
};

interface MiDeviceInfo {
	productId: number;
	frameCounter: number;
	mac?: string;
	capability?: number;
	event?: EventData;
}

function readServiceData(data): MiDeviceInfo {
	if (data.length < 5) return null;
	let offset = 0;

	const frameControl = data.readUInt16LE(0);
	const productId = data.readUInt16LE(2);
	const frameCounter = data.readUInt8(4);

	offset = 5;

	let mac: string;
	let capability: number;
	let event: EventData;

	if (frameControl & FRAME_CONTROL.MAC_INCLUDE) {
		if (data.length < offset + 6) return null;
		mac = data.toString("hex", offset, offset + 5);
		offset += 6;
	}

	if (frameControl & FRAME_CONTROL.CAPABILITY_INCLUDE) {
		if (data.length < offset + 1) return null;
		capability = data.readUInt8(offset);
		offset++;
	}

	if (frameControl & FRAME_CONTROL.EVENT_INCLUDE) {
		if (data.length < offset + 3) return null;
		event = readEventData(data, offset);
	}

	return {
		productId,
		frameCounter,
		mac,
		capability,
		event,
	};
}

interface EventData {
	eventID: number;
	length: number;
	rawHex: string;
	data: Record<string, number>;
}

function readEventData(buffer, offset = 0): EventData {
	const eventID = buffer.readUInt16LE(offset);
	const length = buffer.readUInt8(offset + 2);
	let data;

	if (eventParsers[eventID] && buffer.length >= (offset + 3 + length)) {
		data = eventParsers[eventID](buffer, offset + 3);
	}

	return {
		eventID,
		length,
		rawHex: buffer.toString("hex", offset + 3, (offset + 3 + length)),
		data,
	};
}

const plugin: Plugin = {
	name: "Mi-Temperature",
	description: "Xiaomi Mi Temperatursensor",

	advertisedServices: ["fe95"],
	isHandling: (p) => {
		if (!p.address.toLowerCase().startsWith("4c:65:a8")) return false;
		for (const entry of p.advertisement.serviceData) {
			if (entry.uuid === "fe95") return true;
		}
		return false;
	},

	defineObjects: (peripheral: BLE.Peripheral): PeripheralObjectStructure => {

		const deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: null,
			native: null,
		};

		// no channels

		const stateObjects: StateObjectDefinition[] = [
			{
				id: "battery",
				common: {
					role: "value",
					name: "Battery",
					type: "number",
					unit: "%",
					read: true,
					write: false,
				},
				native: null,
			},
			{
				id: "humidity",
				common: {
					role: "value",
					name: "Humidity",
					desc: "Humidity",
					type: "number",
					unit: "%",
					read: true,
					write: false,
				},
				native: null,
			},
			{
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
			},
		];
		return {
			device: deviceObject,
			channels: null,
			states: stateObjects,
		};
	},

	getValues: (peripheral: BLE.Peripheral): Record<string, any> => {
		let data: Buffer;
		for (const entry of peripheral.advertisement.serviceData) {
			const uuid = entry.uuid;
			if (entry.uuid === "fe95") {
				data = entry.data;
				break;
			}
		}
		if (data == null) return;

		_.log(`mi-temperature >> got data: ${data.toString("hex")}`, "debug");

		const serviceData = readServiceData(data);
		if (!(serviceData && serviceData.event && serviceData.event.data)) {
			_.log(`mi-temperature >> could not parse data`, "debug");
		}
		const eventData = serviceData.event.data;

		const ret: Record<string, any> = {};

		if (eventData.hasOwnProperty("hum")) {
			ret.humidity = eventData.hum;
		}
		if (eventData.hasOwnProperty("tmp")) {
			ret.temperature = eventData.tmp;
		}
		if (eventData.hasOwnProperty("bat")) {
			ret.battery = eventData.bat;
		}

		return ret;
	},
};

export = plugin;
