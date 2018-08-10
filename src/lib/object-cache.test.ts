// tslint:disable:no-console
// tslint:disable:no-unused-expression
// tslint:disable:no-namespace
// tslint:disable:variable-name

import { assert, expect } from "chai";
import * as proxyquireModule from "proxyquire";
import { spy, stub } from "sinon";

// import mocks
const proxyquire = proxyquireModule.noPreserveCache();
import { createCustomSubscriptionsMock } from "../../test/mocks/custom-subscriptions";
import { createGlobalMock } from "../../test/mocks/global";

namespace mocks {
	export const global = createGlobalMock();
	export const adapter = global.Global.adapter;
	export const database = global.Global.database;
	export const customSubscriptions = createCustomSubscriptionsMock();
}

const {
	getObjectCached,
	// tslint:disable-next-line:whitespace
} = proxyquire<typeof import("./object-cache")>("./object-cache", {
	"./custom-subscriptions": mocks.customSubscriptions,
	"../lib/global": mocks.global,
});

describe.only("lib/object-cache", () => {
	it("should call through to the objects DB when an object is requested for the first time", async () => {
		throw "TODO";
	});
});
