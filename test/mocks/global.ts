// tslint:disable-next-line:no-reference

import { stub } from "sinon";

import { createMocks } from "@iobroker/testing";
import { filter as objFilter } from "alcalzone-shared/objects";

export function createGlobalMock() {
	const {adapter, database: db} = createMocks();

	const ret = {
		Global: {
			database: db,
			log: stub(),
			adapter,
			async $$(pattern: string, type: ioBroker.ObjectType, role?: string) {
				// TODO: this is a 1:1 copy of the original implementation. Is there a nicer way?
				const objects = await adapter.getForeignObjectsAsync(pattern, type);
				if (role) {
					return objFilter(objects, o => o.common.role === role);
				} else {
					return objects;
				}
			},
			$: adapter.getForeignObjectAsync,
		},
		resetMockHistory() {
			// reset log
			ret.Global.log.resetHistory();
			ret.Global.adapter.resetMockHistory();
		},
		resetMockBehavior() {
			ret.Global.log.resetBehavior();
			ret.Global.adapter.resetMockBehavior();
		},
		resetMock() {
			this.resetMockHistory();
			this.resetMockBehavior();
		},
	};
	return ret;
}
