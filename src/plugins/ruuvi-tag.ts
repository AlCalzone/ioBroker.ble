/*!
 * Plugin for ruuvi tags with support for the protocol versions 2-5.
 * See https://github.com/ruuvi/ruuvi-sensor-protocols for details
 */

import * as nodeUrl from "url";
import { Global as _ } from "../lib/global";
import { composeObject, entries } from "../lib/object-polyfill";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

const serviceUUID = "feaa";

interface RuuviContext {
	dataFormat: number;
	temperature?: number;
	humidity?: number;
	pressure?: number;
	acceleration?: {
		x: number,
		y: number,
		z: number,
	};
	battery?: number;
	txPower?: number;
	motionCounter?: number;
	sequenceNumber?: number;
	macAddress?: string;
	beaconID?: number;
}

function stripUndefinedProperties<T = any>(obj: Record<string, T>): Record<string, T> {
	return composeObject(
		entries(obj)
			.filter(([key, value]) => value != null),
	);
}

function parseDataFormat2or4(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	const humidity = data.readUInt8(1) * 0.5;

	const temperature = data.readInt8(2);

	const pressure = Math.round((data.readUInt16BE(4) + 50000) / 100); // hPa

	const ret: RuuviContext = {
		dataFormat,
		humidity,
		temperature,
		pressure,
	};
	if (dataFormat === 4 && data.length >= 6) {
		ret.beaconID = data[6];
	}
	return ret;
}

function parseDataFormat3(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	const humidity = data.readUInt8(1) * 0.5;

	const temperature = data.readInt8(2) + data[3] / 100;

	const pressure = Math.round((data.readUInt16BE(4) + 50000) / 100); // hPa

	const acceleration = {
		x: data.readInt16BE(6),
		y: data.readInt16BE(8),
		z: data.readInt16BE(10),
	};

	const battery = data.readUInt16BE(12) / 1000; // mV -> V

	return {
		dataFormat,
		humidity,
		temperature,
		pressure,
		acceleration,
		battery,
	};
}

function parseDataFormat5(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	let temperature = data.readInt16BE(1);
	temperature = temperature !== 0x8000 ? temperature * 0.005 : undefined;

	let humidity = data.readUInt16BE(3);
	humidity = humidity !== 0xffff ? humidity * 0.0025 : undefined;

	let pressure = data.readUInt16BE(5);
	pressure = pressure !== 0xffff ? Math.round((pressure + 50000) / 100) : undefined; // hPa

	let acceleration = {
		x: data.readInt16BE(7),
		y: data.readInt16BE(9),
		z: data.readInt16BE(11),
	};
	acceleration.x = acceleration.x !== 0x8000 ? acceleration.x * 0.001 : undefined;
	acceleration.y = acceleration.y !== 0x8000 ? acceleration.y * 0.001 : undefined;
	acceleration.z = acceleration.z !== 0x8000 ? acceleration.z * 0.001 : undefined;
	if (acceleration.x == undefined && acceleration.y == undefined && acceleration.z == undefined) acceleration = undefined;

	const power = data.readUInt16BE(13);
	let battery: number;
	let txPower: number;
	if ((power >>> 5) !== 0b111_1111_1111) battery = (power >>> 5) * 0.001 + 1.6;
	if ((power & 0b11111) !== 0b11111) txPower = (power & 0b11111) * 2 - 40;

	let movementCounter = data[15];
	if (movementCounter === 0xff) movementCounter = undefined;

	let sequenceNumber = data.readUInt16BE(16);
	if (sequenceNumber === 0xffff) sequenceNumber = undefined;

	let macAddress = data.slice(18, 24).toString("hex");
	if (macAddress === "ffffffffffff") macAddress = undefined;

	return stripUndefinedProperties({
		dataFormat,
		temperature,
		humidity,
		pressure,
		acceleration,
		battery,
		txPower,
		movementCounter,
		sequenceNumber,
		macAddress,
	}) as any as RuuviContext;
}

const plugin: Plugin<RuuviContext> = {
	name: "ruuvi-tag",
	description: "Ruuvi Tag",

	advertisedServices: [serviceUUID],

	isHandling: (peripheral: BLE.Peripheral) => {
		if (!peripheral.advertisement.localName.startsWith("Ruuvi")) return false;
		// variant 1: data in feaa service data
		if (peripheral.advertisement.serviceData.some(entry => entry.uuid === serviceUUID)) return true;
		// variant 2: data in manufacturerData
		// TODO: do we need to discover it in a different way?
		if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0) return true;
	},

	createContext: (peripheral: BLE.Peripheral) => {
		let data: Buffer = getServiceData(peripheral, serviceUUID);
		if (data != null) {
			const url = data.toString("utf8");
			_.log(`ruuvi-tag >> got url: ${data.toString("utf8")}`, "debug");
			// data format 2 or 4 - extract from URL hash
			const hash = nodeUrl.parse(url).hash;
			data = Buffer.from(hash, "base64");
			return parseDataFormat2or4(data);
		} else if (peripheral.advertisement.manufacturerData != null && peripheral.advertisement.manufacturerData.length > 0) {
			data = peripheral.advertisement.manufacturerData;
			// data format 3 or 5 - extract from manufacturerData buffer
			_.log(`ruuvi-tag >> got data: ${data.toString("hex")}`, "debug");
			if (data[0] === 3) {
				return parseDataFormat3(data);
			} else if (data[0] === 5) {
				return parseDataFormat5(data);
			} else {
				_.log(`ruuvi-tag >> {{red|unsupported data format ${data[0]}}}`, "debug");
			}
		}
	},

	defineObjects: (context): PeripheralObjectStructure => {

		if (context == null) return;

		const deviceObject: DeviceObjectDefinition = { // no special definitions neccessary
			common: null,
			native: null,
		};
		if ("beaconID" in context) {
			deviceObject.native = { beaconID: context.beaconID };
		}

		// no channels

		const stateObjects: StateObjectDefinition[] = [];

		const ret = {
			device: deviceObject,
			channels: null,
			states: stateObjects,
		};

		if (context != null) {
			if ("temperature" in context) {
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
			if ("humidity" in context) {
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
			if ("pressure" in context) {
				stateObjects.push({
					id: "pressure",
					common: {
						role: "value",
						name: "Air pressure",
						type: "number",
						unit: "hPa",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("acceleration" in context) {
				if (context.acceleration.x != null) {
					stateObjects.push({
						id: "accelerationX",
						common: {
							role: "value",
							name: "Acceleration (X)",
							type: "number",
							unit: "G",
							read: true,
							write: false,
						},
						native: null,
					});
				}
				if (context.acceleration.y != null) {
					stateObjects.push({
						id: "accelerationY",
						common: {
							role: "value",
							name: "Acceleration (Y)",
							type: "number",
							unit: "G",
							read: true,
							write: false,
						},
						native: null,
					});
				}
				if (context.acceleration.z != null) {
					stateObjects.push({
						id: "accelerationZ",
						common: {
							role: "value",
							name: "Acceleration (Z)",
							type: "number",
							unit: "G",
							read: true,
							write: false,
						},
						native: null,
					});
				}
			}
			if ("battery" in context) {
				stateObjects.push({
					id: "battery",
					common: {
						role: "value",
						name: "Battery",
						desc: "Battery voltage",
						type: "number",
						unit: "mV",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("txPower" in context) {
				stateObjects.push({
					id: "txPower",
					common: {
						role: "value",
						name: "TX Power",
						desc: "Transmit power",
						type: "number",
						unit: "dBm",
						read: true,
						write: false,
					},
					native: null,
				});
			}
			if ("motionCounter" in context) {
				stateObjects.push({
					id: "motionCounter",
					common: {
						role: "value",
						name: "Motion counter",
						desc: "Incremented through motion detection interrupts",
						type: "number",
						read: true,
						write: false,
					},
					native: null,
				});
			}
		}

		return ret;

	},
	getValues: (context): Record<string, any> => {
		if (context == null) return;

		// strip out unnecessary properties
		const {dataFormat, beaconID, macAddress, sequenceNumber, ...remainder} = context;
		// if acceleration exists, we need to rename the acceleration components
		const {acceleration, ...ret} = remainder;
		if (acceleration != null) {
			const {x, y, z} = acceleration;
			if (x != null) (ret as any).accelerationX = x;
			if (y != null) (ret as any).accelerationY = y;
			if (z != null) (ret as any).accelerationZ = z;
		}
		return ret;
	},
};

export = plugin as Plugin;
