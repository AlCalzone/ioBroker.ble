import { expect } from "chai";
import sinon from "sinon";
import plugin from "./qingping";
import { Global as _ } from "../lib/global";
import { PeripheralInfo } from "../lib/scanProcessInterface";

describe("qingping plugin => ", () => {
	describe("correctly detects which peripherals should be handled => ", () => {
		it("yes: Valid advertisement data", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [
						{
							uuid: "fdcd",
							data: Buffer.from("71205b04d4281061c8593f090610023002", "hex"),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(plugin.isHandling(peripheral)).to.be.true;
		});

		it("yes: The service data is not tested again after a successful check", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [{ uuid: "fdcd", data: Buffer.from([]) }],
				},
				address: "the:address:no:longer:matters",
			};
			expect(plugin.isHandling(peripheral)).to.be.true;
		});

		it("no: Valid advertisement data, but wrong UUID", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [
						{
							uuid: "fdce",
							data: Buffer.from("71205b04d4281061c8593f090610023002", "hex"),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(plugin.isHandling(peripheral)).to.be.false;
		});

		it("no: invalid advertisement data", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [
						{
							uuid: "fdcd",
							data: Buffer.from("invaliddata", "hex"),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			expect(plugin.isHandling(peripheral)).to.be.false;
		});

		it("no: no service data", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {},
				address: "the:address:no:longer:matters",
			};
			expect(plugin.isHandling(peripheral)).to.be.false;
		});
	});

	describe("createContext => ", () => {
		it("creates context with valid data", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [
						{
							uuid: "fdcd",
							data: Buffer.from("71205b04d4281061c8593f090610023002", "hex"),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			const context = plugin.createContext(peripheral);
			expect(context).to.have.property("event");
		});

		it("returns undefined for invalid data", () => {
			const peripheral: PeripheralInfo = {
				advertisement: {
					serviceData: [
						{
							uuid: "fdcd",
							data: Buffer.from("invaliddata", "hex"),
						},
					],
				},
				address: "the:address:no:longer:matters",
			};
			const context = plugin.createContext(peripheral);
			expect(context).to.be.undefined;
		});
	});

	describe("defineObjects => ", () => {
		it("defines objects correctly", () => {
			const context = {
				event: {
					temperature: 25.5,
					humidity: 60,
					battery: 90,
				},
			};
			const objects = plugin.defineObjects(context);
			expect(objects).to.have.property("device");
			expect(objects).to.have.property("states").with.lengthOf(3);
		});

		it("returns undefined for undefined context", () => {
			const objects = plugin.defineObjects(undefined);
			expect(objects).to.be.undefined;
		});
	});

	describe("getValues => ", () => {
		it("returns event values correctly", () => {
			const context = {
				event: {
					temperature: 25.5,
					humidity: 60,
					battery: 90,
				},
			};
			const values = plugin.getValues(context);
			expect(values).to.deep.equal(context.event);
		});

		it("returns undefined for undefined context", () => {
			const values = plugin.getValues(undefined);
			expect(values).to.be.undefined;
		});
	});
});