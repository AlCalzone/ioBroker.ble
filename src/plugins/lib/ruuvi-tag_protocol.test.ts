import type { Peripheral } from "@abandonware/noble";
import plugin = require("../ruuvi-tag");

describe("ruuvi-tag protocol (service data) => ", () => {
	// a real packet:
	const peripheral = {
		id: "c0cd266001a0",
		address: "c0:cd:26:60:01:a0",
		addressType: "random",
		connectable: false,
		advertisement: {
			serviceData: [
				{
					uuid: "feaa",
					data: Buffer.from([
						16,
						249,
						3,
						114,
						117,
						117,
						46,
						118,
						105,
						47,
						35,
						66,
						76,
						103,
						67,
						65,
						77,
						73,
						107,
						70,
					]),
				},
			],
			serviceUuids: ["feaa"],
		},
		rssi: -91,
		state: "disconnected",
	} as Peripheral;
	it("should be handling the packet", () => {
		plugin.isHandling(peripheral).should.be.true;
		// also for repeated tests
		plugin.isHandling(peripheral).should.be.true;
	});
});

describe("ruuvi-tag protocol (manufacturer data) => ", () => {
	// a real packet:
	const peripheral = ({
		id: "c0cd266001a0",
		address: "c0:cd:26:60:01:a0",
		addressType: "random",
		connectable: false,
		advertisement: {
			manufacturerData: Buffer.from(
				"990403581b08baa8ffc3004303f90bb3",
				"hex",
			),
			serviceData: [],
			serviceUuids: [],
		},
		rssi: -91,
		state: "disconnected",
	} as any) as Peripheral;
	it("should be handling the packet", () => {
		plugin.isHandling(peripheral).should.be.true;
		// also for repeated tests
		plugin.isHandling(peripheral).should.be.true;
	});
});
