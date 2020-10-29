import type { ChannelObjectDefinition, DeviceObjectDefinition, StateObjectDefinition } from "../plugins/plugin";
import type { PeripheralInfo } from "./scanProcessInterface";
/** Extends a device object in the ioBroker objects DB */
export declare function extendDevice(deviceId: string, peripheral: PeripheralInfo, object: DeviceObjectDefinition): Promise<void>;
export declare function extendChannel(channelId: string, object: ChannelObjectDefinition): Promise<void>;
export declare function extendState(stateId: string, object: StateObjectDefinition): Promise<void>;
