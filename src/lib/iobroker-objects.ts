import { ChannelObjectDefinition, DeviceObjectDefinition, StateObjectDefinition } from "../plugins/plugin";
import { Global as _ } from "./global";

/** Extends a device object in the ioBroker objects DB */
export async function extendDevice(
	deviceId: string,
	peripheral: BLE.Peripheral,
	object: DeviceObjectDefinition,
) {
	const original = await _.objectCache.getObject(`${_.adapter.namespace}.${deviceId}`) as ioBroker.DeviceObject | undefined;
	// update the object while preserving the existing properties
	const updated: ioBroker.SettableObject = {
		type: "device",
		common: {
			name: peripheral.advertisement!.localName!,
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
		original == null
		|| JSON.stringify(original.common) !== JSON.stringify(updated.common)
		|| JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.log(`${original == null ? "creating" : "updating"} device object ${deviceId}`, "debug");
		await _.adapter.setObjectAsync(deviceId, updated);
	}

}

export async function extendChannel(
	channelId: string,
	object: ChannelObjectDefinition,
) {
	const original = await _.objectCache.getObject(`${_.adapter.namespace}.${channelId}`) as ioBroker.ChannelObject | undefined;
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
		original == null
		|| JSON.stringify(original.common) !== JSON.stringify(updated.common)
		|| JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.log(`${original == null ? "creating" : "updating"} channel object ${channelId}`, "debug");
		await _.adapter.setObjectAsync(channelId, updated);
	}
}

export async function extendState(
	stateId: string,
	object: StateObjectDefinition,
) {
	const original = await _.objectCache.getObject(`${_.adapter.namespace}.${stateId}`) as ioBroker.StateObject | undefined;
	// update the object while preserving the existing properties
	// @ts-ignore
	const updated: ioBroker.SettableObject = {
		type: "state",
		common: {
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
		original == null
		|| JSON.stringify(original.common) !== JSON.stringify(updated.common)
		|| JSON.stringify(original.native) !== JSON.stringify(updated.native)
	) {
		_.log(`${original == null ? "creating" : "updating"} state object ${stateId}`, "debug");
		await _.adapter.setObjectAsync(stateId, updated);
	}
}
