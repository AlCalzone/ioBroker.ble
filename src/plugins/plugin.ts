import { ExtendedAdapter } from "../lib/global";

export type DeviceObjectDefinition = Pick<ioBroker.DeviceObject, "common" | "native">;
export type ChannelObjectDefinition = Pick<ioBroker.ChannelObject, "common" | "native"> & { id: string };
export type StateObjectDefinition = Pick<ioBroker.StateObject, "common" | "native"> & { id: string };

/**
 * Defines the object structure for a handled peripheral.
 * RSSI is created by default
 */
export interface PeripheralObjectStructure {
	/**
	 * How the device object should look like.
	 * May be null if the plugin knows that the object exists.
	 */
	device: DeviceObjectDefinition;
	/**
	 * Which channels to create.
	 * May be null if the plugin knows that the objects exist or none should be created.
	 */
	channels: ChannelObjectDefinition[];
	/**
	 * Which states to create.
	 * May be null if the plugin knows that the objects exist.
	 */
	states: StateObjectDefinition[];
}

/** Defines the interface a plugin has to expose */
export interface Plugin<TContext = any> {
	/** Name of the plugin */
	name: string;
	/** Description of the plugin */
	description: string;
	/** A list of services to include in the scan */
	advertisedServices: string[];

	/** Determines whether this plugin is handling a peripheral or not */
	isHandling: (peripheral: BLE.Peripheral) => boolean;
	/** Creates an object used by @see{defineObjects} and @see{getValues} to create their return values */
	createContext: (peripheral: BLE.Peripheral) => TContext;
	/** Defines the object structure for a handled peripheral. */
	defineObjects: (context: TContext) => PeripheralObjectStructure;
	/** Returns the values extracted from the peripheral */
	getValues: (context: TContext) => Record<string, any>;
}

// TODO: provide a way for the plugin to store some context

export function getServiceData(peripheral: BLE.Peripheral, uuid: string): Buffer | null {
	for (const entry of peripheral.advertisement.serviceData) {
		if (entry.uuid === "fe95") return entry.data;
	}
}

/** Aliases an existing plugin with a new name */
export function alias(newName: string, oldPlugin: Plugin): Plugin {
	const {name, ...plugin} = oldPlugin;
	return {
		name: newName,
		...plugin,
	};
}
