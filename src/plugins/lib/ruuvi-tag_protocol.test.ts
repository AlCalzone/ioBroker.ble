// tslint:disable-next-line:no-reference
///<reference path="../../lib/ble.d.ts" />

// tslint:disable:no-unused-expression
// tslint:disable:no-console

import { assert, expect } from "chai";

import * as nodeUrl from "url";
import { ChannelObjectDefinition, DeviceObjectDefinition, getServiceData, PeripheralObjectStructure, Plugin, StateObjectDefinition } from "../plugin";
import { parseDataFormat2or4 } from "./ruuvi-tag_protocol";

// tslint:disable-next-line:no-var-requires
const plugin: Plugin = require("../ruuvi-tag");

describe("ruuvi-tag protocol (service data) => ", () => {
	// a real packet:
	const peripheral: BLE.Peripheral = {
		id: "c0cd266001a0",
		address: "c0:cd:26:60:01:a0",
		addressType: "random",
		connectable: false,
		advertisement: {
			serviceData: [
				{
					uuid: "feaa",
					data: Buffer.from([16, 249, 3, 114, 117, 117, 46, 118, 105, 47, 35, 66, 76, 103, 67, 65, 77, 73, 107, 70]),
				},
			],
			serviceUuids: ["feaa"],
			serviceSolicitationUuids: [],
		},
		rssi: -91,
		state: "disconnected",
	};
	it("should be handling the packet", () => {
		plugin.isHandling(peripheral).should.be.true;
		// also for repeated tests
		plugin.isHandling(peripheral).should.be.true;
	});
});

describe("ruuvi-tag protocol (manufacturer data) => ", () => {
	// a real packet:
	const peripheral: BLE.Peripheral = {
		id: "c0cd266001a0",
		address: "c0:cd:26:60:01:a0",
		addressType: "random",
		connectable: false,
		advertisement: {
			manufacturerData: Buffer.from("990403581b08baa8ffc3004303f90bb3", "hex"),
			serviceData: [],
			serviceUuids: [],
			serviceSolicitationUuids: [],
		},
		rssi: -91,
		state: "disconnected",
	};
	it("should be handling the packet", () => {
		plugin.isHandling(peripheral).should.be.true;
		// also for repeated tests
		plugin.isHandling(peripheral).should.be.true;
	});
});
