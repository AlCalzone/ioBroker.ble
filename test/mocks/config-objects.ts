// tslint:disable-next-line:no-reference

import { spy, stub } from "sinon";

export function createConfigObjectsMock() {
	return {
		createStatusBranch: stub(),
		createConfigBranch: stub(),
		createActionsBranch: stub(),
		createDevicesBranch: stub(),
		createDeviceBranch: stub(),
		createRoomChannel: stub(),
		parseDeviceAssociations: stub(),
		resetMockHistory() {
			this.createStatusBranch.resetHistory();
			this.createConfigBranch.resetHistory();
			this.createActionsBranch.resetHistory();
			this.createDevicesBranch.resetHistory();
			this.createDeviceBranch.resetHistory();
			this.createRoomChannel.resetHistory();
			this.parseDeviceAssociations.resetHistory();
		},
		resetMockBehavior() {
			this.createStatusBranch.resetBehavior();
			this.createConfigBranch.resetBehavior();
			this.createActionsBranch.resetBehavior();
			this.createDevicesBranch.resetBehavior();
			this.createDeviceBranch.resetBehavior();
			this.createRoomChannel.resetBehavior();
			this.parseDeviceAssociations.resetBehavior();
		},
		resetMock() {
			this.resetMockBehavior();
			this.resetMockHistory();
		},
	};
}
