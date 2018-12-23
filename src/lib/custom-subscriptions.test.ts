// tslint:disable:no-unused-expression
// tslint:disable-next-line:no-reference

import { assert, expect } from "chai";
import * as proxyquire from "proxyquire";
import { spy, stub } from "sinon";

// import mocks
import { createGlobalMock } from "../../test/mocks/global";
const globalMock = createGlobalMock();

const {
	subscribeStates, subscribeObjects,
	clearCustomSubscriptions,
	unsubscribeStates, unsubscribeObjects,
	applyCustomStateSubscriptions, applyCustomObjectSubscriptions,
// tslint:disable-next-line:whitespace
} = proxyquire<typeof import("./custom-subscriptions")>("./custom-subscriptions", {
	"./global": globalMock,
});

describe("lib/custom-subscriptions => ", () => {

	afterEach(clearCustomSubscriptions);
	afterEach(() => {
		globalMock.Global.log.reset();
	});

	const subscribeMethods = {
		subscribeStates,
		subscribeObjects,
	};

	for (const name of Object.keys(subscribeMethods)) {
		const method = subscribeMethods[name];
		it(`${name} should accept a string or RegExp pattern`, () => {
			// empty strings work
			method("", null!).should.be.a("string");
			// non-empty strings work
			method("abc", null!).should.be.a("string");
			// RegExp works
			method(/abc/, null!).should.be.a("string");

			globalMock.Global.log.should.not.have.been.called;

			// numbers throw
			expect(method(123 as any, null!)).to.be.undefined;
			globalMock.Global.log.callCount.should.equal(1);
			// objects throw
			expect(method({} as any, null!)).to.be.undefined;
			globalMock.Global.log.callCount.should.equal(2);
			// null/undefined throws
			expect(method(null as any, null!)).to.be.undefined;
			globalMock.Global.log.callCount.should.equal(3);
			expect(method(undefined as any, null!)).to.be.undefined;
			globalMock.Global.log.callCount.should.equal(4);
		});

		it(`${name} should log when an unsupported pattern was given`, () => {
			// empty strings work
			method("", null!);
			// non-empty strings work
			method("abc", null!);
			// RegExp works
			method(/abc/, null!);

			globalMock.Global.log.should.not.have.been.called;

			// numbers throw
			method(123 as any, null!);
			globalMock.Global.log.callCount.should.equal(1);
			// objects throw
			method({} as any, null!);
			globalMock.Global.log.callCount.should.equal(2);
			// null/undefined throws
			method(null as any, null!);
			globalMock.Global.log.callCount.should.equal(3);
			method(undefined as any, null!);
			globalMock.Global.log.callCount.should.equal(4);
		});

		it(`${name} should return an incrementing number as a string`, () => {
			const retVals = new Array(5)
				.fill(undefined)
				.map(() => method("", null!))
				.map(str => parseInt(str, 10))
				;
			for (let i = 1; i < retVals.length; i++) {
				expect(retVals[i] - retVals[i - 1]).to.equal(1);
			}
		});
	}

	it(`unsubscribeStates should work for non-existing subscriptions`, () => {
		unsubscribeStates("does-not-exist");
	});

	it(`unsubscribeStates should work for existing subscriptions`, () => {
		const id = subscribeStates("does-exist", null!);
		unsubscribeStates(id!);
	});

	it(`unsubscribeObjects should work for non-existing subscriptions`, () => {
		unsubscribeObjects("does-not-exist");
	});

	it(`unsubscribeObjects should work for existing subscriptions`, () => {
		const id = subscribeObjects("does-exist", null!);
		unsubscribeObjects(id!);
	});

	it(`applyCustomStateSubscriptions should call only the matching subscriptions`, () => {
		const matchingCB = spy();
		const nonMatchingCB = spy();

		subscribeStates("this.state.matches", matchingCB);
		subscribeStates(/matches$/, matchingCB);
		subscribeStates("this.does.not.match", nonMatchingCB);
		subscribeStates(/not\.match$/, nonMatchingCB);

		const state = {foo: "bar"} as any as ioBroker.State;
		applyCustomStateSubscriptions("this.state.matches", state);

		matchingCB.should.have.been.calledTwice;
		matchingCB.should.have.been.calledWithExactly("this.state.matches", state);
		nonMatchingCB.should.not.have.been.called;
	});

	it(`applyCustomObjectSubscriptions should call only the matching subscriptions`, () => {
		const matchingCB = spy();
		const nonMatchingCB = spy();

		subscribeObjects("this.object.matches", matchingCB);
		subscribeObjects(/matches$/, matchingCB);
		subscribeObjects("this.does.not.match", nonMatchingCB);
		subscribeObjects(/not\.match$/, nonMatchingCB);

		const obj = {foo: "bar"} as any as ioBroker.Object;
		applyCustomObjectSubscriptions("this.object.matches", obj);

		matchingCB.should.have.been.calledTwice;
		matchingCB.should.have.been.calledWithExactly("this.object.matches", obj);
		nonMatchingCB.should.not.have.been.called;
	});

	it("when a callback throws, the error should be logged", () => {
		const thisThrows = stub().throwsException();

		const stateName = "a.state";
		subscribeObjects(stateName, thisThrows);
		subscribeStates(stateName, thisThrows);

		applyCustomObjectSubscriptions(stateName, null);
		globalMock.Global.log.callCount.should.equal(1);

		applyCustomStateSubscriptions(stateName, null);
		globalMock.Global.log.callCount.should.equal(2);
	});

});
