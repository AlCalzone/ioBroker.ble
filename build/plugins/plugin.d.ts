/// <reference types="iobroker" />
/// <reference types="node" />
import type { PeripheralInfo } from "../lib/scanProcessInterface";
export declare type DeviceObjectDefinition = Partial<Pick<ioBroker.DeviceObject, "common" | "native">>;
export declare type ChannelObjectDefinition = Partial<Pick<ioBroker.ChannelObject, "common" | "native">> & {
    id: string;
};
export declare type StateObjectDefinition = Partial<Pick<ioBroker.StateObject, "common" | "native">> & {
    id: string;
};
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
export declare function getServiceData(peripheral: PeripheralInfo, uuid: string): Buffer | undefined;
/** Aliases an existing plugin with a new name */
export declare function alias(newName: string, oldPlugin: Plugin): Plugin;
