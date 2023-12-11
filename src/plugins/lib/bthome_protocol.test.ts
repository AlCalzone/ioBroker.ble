import { expect } from "chai";
import { BTHomeAdvertisement } from "./bthome_protocol";

function assertMultilevelSensor(
	packet: BTHomeAdvertisement,
	label: string,
	value: number,
) {
	const sensor = packet.multilevelSensors.find((s) => s.label === label);
	expect(sensor).to.exist;
	expect(sensor!.value).to.equal(value);
}

function assertBinarySensor(
	packet: BTHomeAdvertisement,
	label: string,
	value: boolean,
) {
	const sensor = packet.binarySensors.find((s) => s.label === label);
	expect(sensor).to.exist;
	expect(sensor!.value).to.equal(value);
}

describe("bthome protocol => ", () => {
	describe("packets should be parsed correctly => ", () => {
		it("incomplete packet", () => {
			function create(hex: string) {
				return new BTHomeAdvertisement(Buffer.from(hex, "hex"));
			}
			expect(() => create("")).to.throw("1 byte");
		});

		it("Test 1", () => {
			const frame = Buffer.from(
				"4400980164055802002101", // 3a01
				"hex",
			);
			const parsed = new BTHomeAdvertisement(frame);

			parsed.packetId!.should.equal(0x98);
			assertMultilevelSensor(parsed, "battery", 100);
			assertMultilevelSensor(parsed, "illuminance", 6);
			assertBinarySensor(parsed, "motion", true);
		});
	});
});
