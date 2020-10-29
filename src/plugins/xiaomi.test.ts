import { expect } from "chai";
import xiaomiPlugin = require("./xiaomi");

describe("xiaomi plugin => ", () => {
	describe("correctly detects which peripherals should be handled => ", () => {
		it("yes: Valid advertisement data", () => {
			const peripheral = {
				advertisement: {
					serviceData: [
						{
							uuid: "fe95",
							data: Buffer.from(
								"70205b04d4281061c8593f090610023002",
								"hex",
							),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.true;
		});

		it("yes: The service data is not tested again after a successful check", () => {
			const peripheral = {
				advertisement: {
					serviceData: [{ uuid: "fe95", data: Buffer.from([]) }],
				},
				address: "the:address:no:longer:matters",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.true;
		});

		it("no: Valid advertisement data, but wrong UUID", () => {
			const peripheral = {
				advertisement: {
					serviceData: [
						{
							uuid: "fe96",
							data: Buffer.from(
								"70205b04d4281061c8593f090610023002",
								"hex",
							),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.false;
		});

		it("no: invalid advertisement data", () => {
			const peripheral = {
				advertisement: {
					serviceData: [
						{
							uuid: "fe96",
							data: Buffer.from(
								"71205b04d4281061c8593f090610023002",
								"hex",
							),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.false;
		});

		it("no: no service data", () => {
			const peripheral = {
				advertisement: {},
				address: "the:address:no:longer:matters",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.false;
		});
	});
});
