/*!
 * Plugin for ruuvi tags with support for the protocol versions 2-5.
 * See https://github.com/ruuvi/ruuvi-sensor-protocols for details
 */

import * as nodeUrl from "url";
import { Global as _ } from "../lib/global";
import { composeObject, entries, stripUndefinedProperties } from "../lib/object-polyfill";
import { parseDataFormat2or4, parseDataFormat3, parseDataFormat5, RuuviContext } from "./lib/ruuvi-tag_protocol";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "./plugin";

const serviceUUID = "feaa";

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
