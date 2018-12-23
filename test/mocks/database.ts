// tslint:disable:unified-signatures
// tslint:disable-next-line:no-reference

import { composeObject, extend, filter as objFilter } from "alcalzone-shared/objects";
import { str2regex } from "../../src/lib/str2regex";
import { MockAdapter } from "./global";

const objectTemplate = Object.freeze({
	type: "state",
	common: { name: "an object" },
	native: {},
} as ioBroker.Object);

const stateTemplate = Object.freeze({
	ack: false,
	val: 0,
} as ioBroker.State);

export class MockDatabase {

	public objects = new Map<string, ioBroker.Object>();
	public states = new Map<string, ioBroker.State>();

	public clearObjects() {
		this.objects.clear();
	}
	public clearStates() {
		this.states.clear();
	}
	public clear() {
		this.clearObjects();
		this.clearStates();
	}

	public publishObject(obj: ioBroker.PartialObject) {
		if (obj._id == null) throw new Error("An object must have an ID");
		if (obj.type == null) throw new Error("An object must have a type");

		const completeObject = extend({}, objectTemplate, obj) as ioBroker.Object;
		this.objects.set(obj._id!, completeObject);
	}
	public publishObjects(...objects: ioBroker.PartialObject[]) {
		objects.forEach(this.publishObject);
	}
	public publishStateObjects(...objects: ioBroker.PartialObject[]) {
		objects
			.map(obj => extend({}, obj, { type: "state" }))
			.forEach(this.publishObject.bind(this))
			;
	}
	public publishChannelObjects(...objects: ioBroker.PartialObject[]) {
		objects
			.map(obj => extend({}, obj, { type: "channel" }))
			.forEach(this.publishObject.bind(this))
			;
	}
	public publishDeviceObjects(...objects: ioBroker.PartialObject[]) {
		objects
			.map(obj => extend({}, obj, { type: "device" }))
			.forEach(this.publishObject.bind(this))
			;
	}

	public deleteObject(obj: ioBroker.PartialObject);
	public deleteObject(objID: string);
	public deleteObject(objOrID: string | ioBroker.PartialObject) {
		this.objects.delete(typeof objOrID === "string" ? objOrID : objOrID._id!);
	}

	public publishState(id: string, state: Partial<ioBroker.State>) {
		if (typeof id !== "string") throw new Error("The id must be given!");
		if (state == null) {
			this.deleteState(id);
			return;
		}
		const completeState = extend({}, stateTemplate, state) as ioBroker.State;
		this.states.set(id, completeState);
	}
	public deleteState(id: string) {
		this.states.delete(id);
	}

	public hasObject(id: string): boolean;
	public hasObject(namespace: string, id: string): boolean;
	public hasObject(namespaceOrId: string, id?: string): boolean {
		id = namespaceOrId + (id ? "." + id : "");
		return this.objects.has(id);
	}

	public getObject(id: string): ioBroker.Object | undefined;
	public getObject(namespace: string, id: string): ioBroker.Object | undefined;
	public getObject(namespaceOrId: string, id?: string): ioBroker.Object | undefined {
		// combines getObject and getForeignObject into one
		id = namespaceOrId + (id ? "." + id : "");
		return this.objects.get(id);
	}

	public hasState(id: string): boolean;
	public hasState(namespace: string, id: string): boolean;
	public hasState(namespaceOrId: string, id?: string): boolean {
		id = namespaceOrId + (id ? "." + id : "");
		return this.states.has(id);
	}

	public getState(id: string): ioBroker.State | undefined;
	public getState(namespace: string, id: string): ioBroker.State | undefined;
	public getState(namespaceOrId: string, id?: string): ioBroker.State | undefined {
		// combines getObject and getForeignObject into one
		id = namespaceOrId + (id ? "." + id : "");
		return this.states.get(id);
	}

	public getObjects(pattern: string, type?: ioBroker.ObjectType);
	public getObjects(namespace: string, pattern: string, type?: ioBroker.ObjectType);
	public getObjects(namespaceOrPattern: string, patternOrType?: string | ioBroker.ObjectType, type?: ioBroker.ObjectType) {
		// combines getObjects and getForeignObjects into one
		let pattern: string;
		if (type != undefined) {
			pattern = namespaceOrPattern + (patternOrType ? "." + patternOrType : "");
		} else if (patternOrType != undefined) {
			if (["state", "channel", "device"].indexOf(patternOrType) > -1) {
				type = patternOrType as ioBroker.ObjectType;
				pattern = namespaceOrPattern;
			} else {
				pattern = namespaceOrPattern + "." + patternOrType;
			}
		} else {
			pattern = namespaceOrPattern;
		}

		const idRegExp = str2regex(pattern);

		return composeObject(
			[...this.objects.entries()]
				.filter(([id]) => idRegExp.test(id))
				.filter(([, obj]) => type == null || obj.type === type),
		) as Record<string, ioBroker.Object>;
	}

	public getStates(pattern: string) {
		// combines getStates and getForeignStates into one
		const idRegExp = str2regex(pattern);
		return composeObject(
			[...this.states.entries()]
				.filter(([id]) => idRegExp.test(id)),
		) as Record<string, ioBroker.State>;
	}
}

export function createAsserts(db: MockDatabase, adapter: MockAdapter) {
	function normalizeID(prefix: string, suffix?: string) {
		let id = `${prefix}${suffix ? "." + suffix : ""}`;
		// Test if this ID is fully qualified
		if (!/^[a-z0-9\-_]+\.\d+\./.test(id)) {
			id = adapter.namespace + "." + id;
		}
		return id;
	}
	const ret = {
		assertObjectExists(prefix: string, suffix: string) {
			const id = normalizeID(prefix, suffix);
			db.hasObject(id).should.equal(true, `The object "${adapter.namespace}.${id}" does not exist but it was expected to!`);
		},
		assertStateExists(prefix: string, suffix?: string) {
			const id = normalizeID(prefix, suffix);
			db.hasState(id).should.equal(true, `The state "${adapter.namespace}.${id}" does not exist but it was expected to!`);
		},
		assertStateHasValue(prefix: string, suffix: string, value: any) {
			ret.assertStateProperty(prefix, suffix, "val", value);
		},
		assertStateIsAcked(prefix: string, suffix: string, ack: boolean = true) {
			ret.assertStateProperty(prefix, suffix, "ack", ack);
		},
		assertStateProperty(prefix: string, suffix: string, property: string, value: any) {
			const id = normalizeID(prefix, suffix);
			ret.assertStateExists(id, undefined);
			db.getState(id)!
				.should.be.an("object")
				.that.has.property(property, value)
				;
		},
		assertObjectCommon(prefix: string, suffix: string, common: ioBroker.ObjectCommon) {
			const id = normalizeID(prefix, suffix);
			ret.assertObjectExists(prefix, suffix);
			const dbObj = db.getObject(id)!;
			dbObj.should.be.an("object")
				.that.has.property("common");
			dbObj.common.should.be.an("object")
				.that.nested.include(common);
		},
		assertObjectNative(prefix: string, suffix: string, native: object) {
			const id = normalizeID(prefix, suffix);
			ret.assertObjectExists(prefix, suffix);
			const dbObj = db.getObject(id)!;
			dbObj.should.be.an("object")
				.that.has.property("native");
			dbObj.native.should.be.an("object")
				.that.nested.include(native);
		},
	};
	return ret;
}
