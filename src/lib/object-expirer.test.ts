// tslint:disable:no-console
// tslint:disable:no-unused-expression
// tslint:disable:no-namespace
// tslint:disable:variable-name

import { wait } from "alcalzone-shared/async";
import { extend } from "alcalzone-shared/objects";
import { assert, expect } from "chai";
import * as proxyquireModule from "proxyquire";
import { SinonFakeTimers, spy, stub, useFakeTimers } from "sinon";

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

// tslint:disable-next-line:whitespace
const { ObjectExpirer } = proxyquire<typeof import("./object-expirer")>("./object-expirer", {
	"./custom-subscriptions": mocks.customSubscriptions,
	"../lib/global": mocks.global,
});

describe("lib/object-expirer => ", () => {
	
});
