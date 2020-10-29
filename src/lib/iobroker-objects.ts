import type {
	ChannelObjectDefinition,
	DeviceObjectDefinition,
	StateObjectDefinition,
} from "../plugins/plugin";
import { Global as _ } from "./global";
import type { PeripheralInfo } from "./scanProcessInterface";

/** Extends a device object in the ioBroker objects DB */
export async function extendDevice(
	deviceId: string,
	peripheral: PeripheralInfo,
	object: DeviceObjectDefinition,
): Promise<void> {
	const original = (await _.objectCache.getObject(
		`${_.adapter.namespace}.${deviceId}`,
	)) as ioBroker.DeviceObject | undefined;
	// update the object while preserving the existing properties
	const updated: ioBroker.SettableObject = {
		type: "device",
		common: {
			name: peripheral.advertisement.localName,
			...object.common,
			...(original && original.common),
		},
		native: {
			id: peripheral.id,
			address: peripheral.address,
			addressType: peripheral.addressType,
			connectable: peripheral.connectable,
			...object.native,
			...(original && original.native),
		},
	};

	// check if we have to update anything
	if (
		original == null ||
		JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
		JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.adapter.log.debug(
			`${
				original == null ? "creating" : "updating"
			} device object ${deviceId}`,
		);
		await _.adapter.setObjectAsync(deviceId, updated);
	}
}

export async function extendChannel(
	channelId: string,
	object: ChannelObjectDefinition,
): Promise<void> {
	const original = (await _.objectCache.getObject(
		`${_.adapter.namespace}.${channelId}`,
	)) as ioBroker.ChannelObject | undefined;
	// update the object while preserving the existing properties
	const updated: ioBroker.SettableObject = {
		type: "channel",
		common: {
			name: channelId,
			...object.common,
			...(original && original.common),
		},
		native: {
			...object.native,
			...(original && original.native),
		},
	};

	// check if we have to update anything
	if (
		original == null ||
		JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
		JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.adapter.log.debug(
			`${
				original == null ? "creating" : "updating"
			} channel object ${channelId}`,
		);
		await _.adapter.setObjectAsync(channelId, updated);
	}
}

export async function extendState(
	stateId: string,
	object: StateObjectDefinition,
): Promise<void> {
	const original = (await _.objectCache.getObject(
		`${_.adapter.namespace}.${stateId}`,
	)) as ioBroker.StateObject | undefined;
	// update the object while preserving the existing properties
	const updated: ioBroker.SettableObject = {
		type: "state",
		common: {
			role: "state",
			read: true,
			write: false,
			name: stateId,
			...object.common,
			...(original && original.common),
		},
		native: {
			...object.native,
			...(original && original.native),
		},
	};

	// check if we have to update anything
	if (
		original == null ||
		JSON.stringify(original.common) !== JSON.stringify(updated.common) ||
		JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.adapter.log.debug(
			`${
				original == null ? "creating" : "updating"
			} state object ${stateId}`,
		);
		await _.adapter.setObjectAsync(stateId, updated);
	}
}
