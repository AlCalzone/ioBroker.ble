/// <reference path="../lib/ble.d.ts" />
// tslint:disable:no-unused-expression
// tslint:disable:no-console

import { assert, expect } from "chai";
import xiaomiPlugin = require("./xiaomi");

describe("xiaomi plugin => ", () => {
	describe("correctly detects which peripherals should be handled => ", () => {
		it("MAC prefix 3f:59:c8", () => {
			const peripheral = {
				advertisement: {
					serviceData: [{"uuid":"fe95","data": Buffer.from("70205b04d4281061c8593f090610023002", "hex")}]
				},
				address: "3f:59:c8:61:10:28",
			};
			expect(xiaomiPlugin.isHandling(peripheral as any)).to.be.true;
		});
	});
});