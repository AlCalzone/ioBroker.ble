import type { PeripheralInfo } from "../lib/scanProcessInterface";

export type DeviceObjectDefinition = Partial<
	Pick<ioBroker.DeviceObject, "common" | "native">
>;
export type ChannelObjectDefinition = Partial<
	Pick<ioBroker.ChannelObject, "common" | "native">
> & { id: string };
export type StateObjectDefinition = Partial<
	Pick<ioBroker.StateObject, "common" | "native">
> & { id: string };

/**
 * Defines the object structure for a handled peripheral.
 * RSSI is created by default
 */
export interface PeripheralObjectStructure {
	/**
	 * How the device object should look like.
	 */
	device: DeviceObjectDefinition;
	/**
	 * Which channels to create.
	 * May be undefined if the plugin knows that the objects exist or none should be created.
	 */
	channels: ChannelObjectDefinition[] | undefined;
	/**
	 * Which states to create.
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
	isHandling: (peripheral: PeripheralInfo) => boolean;
	/** Creates an object used by @see{defineObjects} and @see{getValues} to create their return values */
	createContext: (peripheral: PeripheralInfo) => TContext | undefined;
	/** Defines the object structure for a handled peripheral. */
	defineObjects: (context: TContext) => PeripheralObjectStructure | undefined;
	/** Returns the values extracted from the peripheral */
	getValues: (context: TContext) => Record<string, any> | undefined;
}

export function getServiceData(
	peripheral: PeripheralInfo,
	uuid: string,
): Buffer | undefined {
	for (const entry of peripheral.advertisement!.serviceData!) {
		if (entry.uuid === uuid) return entry.data;
	}
}

/** Aliases an existing plugin with a new name */
export function alias(newName: string, oldPlugin: Plugin): Plugin {
	const { name, ...plugin } = oldPlugin;
	return {
		name: newName,
		...plugin,
	};
}
