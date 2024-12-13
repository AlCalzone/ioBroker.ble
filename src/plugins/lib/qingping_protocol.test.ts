import { expect } from "chai";
import { QingpingAdvertisement, QingpingEvent } from "./qingping_protocol";

describe("QingpingAdvertisement", () => {
	describe("constructor", () => {
		it("should throw an error if the data length is less than 17 bytes", () => {
			const data = Buffer.alloc(16);
			expect(() => new QingpingAdvertisement(data)).to.throw(
				"A Qingping advertisement frame must be at least 17 bytes long",
			);
		});

		it("should correctly parse the advertisement data", () => {
			const data = Buffer.from([
				0x08, 0x10, 0x8b, 0x81, 0x82, 0x34, 0x2d, 0x58, 0x01, 0x04,
				0xe4, 0x00, 0xb8, 0x01, 0x02, 0x01, 0x4d,
			]);

			const adv = new QingpingAdvertisement(data);

			expect(adv.macAddress).to.equal("58:2d:34:82:81:8b");
			expect(adv.hasEvent).to.be.true;
			expect(adv.event).to.deep.equal(new QingpingEvent(22.8, 44.0, 77));
		});
	});

	describe("decodeMessage", () => {
		it("should decode the message according to the schema", () => {
			const data = Buffer.from([
				0x08, 0x10, 0x8b, 0x81, 0x82, 0x34, 0x2d, 0x58, 0x01, 0x04,
				0xe4, 0x00, 0xb8, 0x01, 0x02, 0x01, 0x4d,
			]);

			const adv = new QingpingAdvertisement(data);
			const schema = {
				fields: [
					{ name: "mac", offset: 2, length: 6, type: "mac" },
					{
						name: "temperature",
						offset: 10,
						length: 2,
						type: "int16",
						scale: 0.1,
					},
					{
						name: "humidity",
						offset: 12,
						length: 2,
						type: "uint16",
						scale: 0.1,
					},
					{ name: "battery", offset: 16, length: 1, type: "uint8" },
				],
			};

			const result = adv["decodeMessage"](data, schema);

			expect(result).to.deep.equal({
				mac: "8b:81:82:34:2d:58",
				temperature: 22.8,
				humidity: 44,
				battery: 77,
			});
		});
	});
});
