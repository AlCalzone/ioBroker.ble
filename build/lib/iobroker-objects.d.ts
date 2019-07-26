import { ChannelObjectDefinition, DeviceObjectDefinition, StateObjectDefinition } from "../plugins/plugin";
/** Extends a device object in the ioBroker objects DB */
export declare function extendDevice(deviceId: string, peripheral: BLE.Peripheral, object: DeviceObjectDefinition): Promise<void>;
export declare function extendChannel(channelId: string, object: ChannelObjectDefinition): Promise<void>;
export declare function extendState(stateId: string, object: StateObjectDefinition): Promise<void>;
