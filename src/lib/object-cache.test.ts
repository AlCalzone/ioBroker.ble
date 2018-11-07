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
const { ObjectCache } = proxyquire<typeof import("./object-cache")>("./object-cache", {
	"./custom-subscriptions": mocks.customSubscriptions,
	"../lib/global": mocks.global,
});

describe.only("lib/object-cache", () => {

	afterEach(() => {
		mocks.global.resetMockHistory();
		mocks.customSubscriptions.resetMock();
		mocks.database.clear();
	});

	describe("getObject() => ", () => {
		it("should call through to the objects DB when an object is requested for the first time", async () => {
			const cache = new ObjectCache();

			const theObject: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(theObject);

			const retrievedObject = await cache.getObject("whatever");
			expect(retrievedObject!.common.role).to.equal(theObject.common!.role);
		});

		it("should return the cached object even if the database changed", async () => {
			const cache = new ObjectCache();

			const obj1: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			await cache.getObject("whatever");

			// publish an updated copy
			const obj2 = extend({}, obj1, { common: { role: "updated" } });
			mocks.database.publishObject(obj2);

			const retrievedObject = await cache.getObject("whatever");
			// we expect the original object
			expect(retrievedObject!.common.role).to.equal(obj1.common!.role);
		});

		it("if an object does not exist, nothing should be cached", async () => {
			const cache = new ObjectCache();

			await cache.getObject("does not exist");
			await cache.getObject("does not exist");

			const obj1: ioBroker.PartialObject = {
				_id: "does not exist",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			const result = await cache.getObject("does not exist");
			expect(result).not.to.be.null;
		});
	});

	describe("invalidateObject() => ", () => {
		it("should cause getObject() to re-query the database", async () => {
			const cache = new ObjectCache();

			const obj1: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			await cache.getObject("whatever");

			// invalidate the cache
			cache.invalidateObject("whatever");

			// publish an updated copy
			const obj2 = extend({}, obj1, { common: { role: "updated" } });
			mocks.database.publishObject(obj2);

			const retrievedObject = await cache.getObject("whatever");
			// now we want the updated object
			expect(retrievedObject!.common.role).to.equal(obj2.common!.role);
		});
	});

	describe("updateObject() => ", () => {
		it("should cause getObject() to return the updated object", async () => {
			const cache = new ObjectCache();

			const obj1: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			const original = await cache.getObject("whatever");

			// cache an updated copy
			const obj2 = extend({}, original!, { common: { role: "updated" } }) as ioBroker.Object;
			cache.updateObject(obj2);

			const retrievedObject = await cache.getObject("whatever");
			// now we want the updated object
			expect(retrievedObject!.common.role).to.equal(obj2.common.role);
		});

		it("should not cause getObject() to re-query the database", async () => {
			const cache = new ObjectCache();

			const obj1: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			const original = await cache.getObject("whatever");

			// cache an updated copy
			const obj2 = extend({}, original!, { common: { role: "cached" } }) as ioBroker.Object;
			cache.updateObject(obj2);

			// publish an updated copy
			const obj3 = extend({}, obj1, { common: { role: "updated" } });
			mocks.database.publishObject(obj3);

			const retrievedObject = await cache.getObject("whatever");
			// now we want the cached object
			expect(retrievedObject!.common.role).to.equal("cached");
		});
	});

	describe("automatic expiration =>", () => {

		let clock: SinonFakeTimers;
		const DURATION = 1000;

		beforeEach(() => {
			clock = useFakeTimers();
		});
		afterEach(() => {
			clock.restore();
		});

		it("after the configured expiry duration has elapsed, objects should be re-read from the database", async () => {
			const cache = new ObjectCache(DURATION);

			// create the object in the db
			const obj1: ioBroker.PartialObject = {
				_id: "whatever",
				type: "state",
				common: {
					role: "whatever",
				},
			};
			mocks.database.publishObject(obj1);
			// cache the original version
			const original = await cache.getObject("whatever");

			clock.tick(DURATION / 2);

			// publish an updated copy
			const obj2 = extend({}, obj1, { common: { role: "updated" } });
			mocks.database.publishObject(obj2);

			// The full duration hasn't elapsed, we expect the original object
			const notExpired = await cache.getObject("whatever");
			notExpired!.should.deep.equal(original);

			clock.tick(DURATION / 2);

			// now it has, expect the updated object
			const expired = await cache.getObject("whatever");
			expired!.should.not.deep.equal(original);

		});

		it.skip("test multiple expirations in sequence", () => {
			// TODO
		});
	});
});
