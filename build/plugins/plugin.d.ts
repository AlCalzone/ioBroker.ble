/// <reference types="node" />
export declare type DeviceObjectDefinition = Pick<ioBroker.DeviceObject, "common" | "native">;
export declare type ChannelObjectDefinition = Pick<ioBroker.ChannelObject, "common" | "native"> & {
    id: string;
};
export declare type StateObjectDefinition = Pick<ioBroker.StateObject, "common" | "native"> & {
    id: string;
};
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
export interface Plugin {
    /** Name of the plugin */
    name: string;
    /** Description of the plugin */
    description: string;
    /** A list of services to include in the scan */
    advertisedServices: string[];
    /** Determines whether this plugin is handling a peripheral or not */
    isHandling: (peripheral: BLE.Peripheral) => boolean;
    /** Defines the object structure for a handled peripheral. */
    defineObjects: (peripheral: BLE.Peripheral) => PeripheralObjectStructure;
    /** Returns the values extracted from the peripheral */
    getValues: (peripheral: BLE.Peripheral) => {
        [id: string]: any;
    };
}
export declare function getServiceData(peripheral: BLE.Peripheral, uuid: string): Buffer | null;
/** Aliases an existing plugin with a new name */
export declare function alias(newName: string, oldPlugin: Plugin): Plugin;
