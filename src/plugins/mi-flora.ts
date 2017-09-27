import { Global as _ } from "../lib/global";
import { ChannelObjectDefinition, DeviceObjectDefinition, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

/**
 * Checks if two buffers or arrays are equal
 */
function bufferEquals(buf1: Buffer | number[], buf2: Buffer | number[]): boolean {
	if (buf1.length !== buf2.length) return false;
	for (let i = 0; i < buf1.length; i++) {
		if (buf1[i] !== buf2[i]) return false;
	}
	return true;
}
function reverseBuffer(buf: Buffer): Buffer {
	const ret = Buffer.allocUnsafe(buf.length);
	for (let i = 0; i < buf.length; i++) {
		ret[i] = buf[buf.length - 1 - i];
	}
	return ret;
}

const PREFIX = [0x71, 0x20, 0x98, 0x00];

const plugin: Plugin = {
	name: "Mi-Flora",
	description: "Xiaomi Mi Pflanzensensor",

	advertisedServices: ["fe95"],
	isHandling: (p) => {
		if (!p.address.toLowerCase().startsWith("c4:7c:8d")) return false;
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
			},
			{
				id: "brightness",
				common: {
					role: "value",
					name: "Brightness",
					type: "number",
					unit: "lux",
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
					desc: "Humidity of the soil",
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

	getValues: (peripheral: BLE.Peripheral): { [id: string]: any } => {
		let data: Buffer;
		for (const entry of peripheral.advertisement.serviceData) {
			const uuid = entry.uuid;
			if (entry.uuid === "fe95") {
				data = entry.data;
				break;
			}
		}
		if (data == null) return;

		// do some basic checks
		// Data length must be 15 bytes plus data[14]
		if (data.length < 15) return;
		if (data.length !== 15 + data[14]) return;
		// Data must start with the prefix
		if (!bufferEquals(data.slice(0, 4), PREFIX)) return;
		// Data must contain the reversed MAC at index 5
		const mac = peripheral.address.replace(/\:/g, "").toLowerCase();
		if (reverseBuffer(data.slice(5, 5 + 6)).toString("hex") !== mac) return;

		// parse data
		const type = data[12];
		const length = data[14];
		// read <length> LE bytes at the end
		let value = 0;
		for (let i = 1; i <= length; i++) {
			value = (value << 8) + data[data.length - i];
		}

		let stateId: string;
		switch (type) {
			case 0x4:
				stateId = "temperature";
				value /= 10;
				break;
			case 0x7:
				stateId = "brightness";
				break;
			case 0x8:
				stateId = "humidity";
				break;
			case 0x9:
				stateId = "fertility";
				break;
		}

		const ret = {};
		ret[stateId] = value;
		return ret;
	},
};

export = plugin;

/*
PROTOCOL:
INDEX: 0 1 2 3 4 5 6 7 8 9 101112131415
DATA:  712098004f795d658d7cc40d08100117
	   PPPPPPPP  MMMMMMMMMMMM  TT  LL
			   SS            ??  ??  xx

P: Prefix
S: Sequence number
M: MAC ADDRESS
T: Type
	08 = Humidity (1B)
	04 = Temperature*10  (2B)
	07 = Lux (3B)
	09 = fertility (µs/cm) (2B)
L: Data length
x: Data

*/
