/// <reference types="iobroker" />
import { ObjectCache } from "./object-cache";
export interface ExtendedAdapter extends ioBroker.Adapter {
    __isExtended: boolean;
    /** Reads an object from the object db */
    $getObject(id: string, options?: any): Promise<ioBroker.Object>;
    /** Get all states, channels and devices of this adapter */
    $getAdapterObjects(): Promise<Record<string, ioBroker.Object>>;
    /** Creates or overwrites an object in the object db */
    $setObject(id: string, obj: ioBroker.SettableObject, options?: any): Promise<{
        id: string;
    }>;
    /** Creates an object in the object db if it doesn't exist yet */
    $setObjectNotExists(id: string, obj: ioBroker.SettableObject, options?: any): Promise<{
        id: string;
    }>;
    /** Extends an object in the object db */
    $extendObject(id: string, obj: ioBroker.PartialObject, options?: any): Promise<{
        id: string;
    }>;
    /** Reads an object (which might not belong to this adapter) from the object db */
    $getForeignObject(id: string, options?: any): Promise<ioBroker.Object>;
    /** Creates or overwrites an object (which might not belong to this adapter) in the object db */
    $setForeignObject(id: string, obj: ioBroker.SettableObject, options?: any): Promise<{
        id: string;
    }>;
    /** Creates an object (which might not belong to this adapter) in the object db if it doesn't exist yet */
    $setForeignObjectNotExists(id: string, obj: ioBroker.SettableObject, options?: any): Promise<{
        id: string;
    }>;
    /** Extends an object in the object (which might not belong to this adapter) db */
    $extendForeignObject(id: string, obj: ioBroker.PartialObject, options?: any): Promise<{
        id: string;
    }>;
    /** Get foreign objects by pattern, by specific type and resolve their enums. */
    $getForeignObjects(pattern: string, type?: ioBroker.ObjectType, enums?: ioBroker.EnumList, options?: any): Promise<Record<string, ioBroker.Object>>;
    /** creates an object with type device */
    $createDevice(deviceName: string, common?: ioBroker.ObjectCommon, native?: any, options?: any): Promise<{
        id: string;
    }>;
    /** deletes a device, its channels and states */
    $deleteDevice(deviceName: string, options?: any): Promise<void>;
    /** creates an object with type channel */
    $createChannel(parentDevice: string, channelName: string, roleOrCommon?: string | ioBroker.ChannelCommon, native?: any, options?: any): Promise<{
        id: string;
    }>;
    /** deletes a channel and its states */
    $deleteChannel(channelName: string, options?: any): Promise<void>;
    $deleteChannel(parentDevice: string, channelName: string, options?: any): Promise<void>;
    /** Read a value from the states DB. */
    $getState(id: string, options?: any): Promise<ioBroker.State>;
    /** Read all states of this adapter which match the given pattern */
    $getStates(pattern: string, options?: any): Promise<Record<string, ioBroker.State>>;
    /** Writes a value into the states DB. */
    $setState(id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any): Promise<string>;
    /** Writes a value into the states DB only if it has changed. */
    $setStateChanged(id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any): Promise<string>;
    /** creates a state and the corresponding object */
    $createState(parentDevice: string, parentChannel: string, stateName: string, roleOrCommon?: string | ioBroker.StateCommon, native?: any, options?: any): Promise<{
        id: string;
    }>;
    /** deletes a state */
    $deleteState(stateName: string, options?: any): Promise<void>;
    $deleteState(parentChannel: string, stateName: string, options?: any): Promise<void>;
    $deleteState(parentDevice: string, parentChannel: string, stateName: string, options?: any): Promise<void>;
    /** Deletes a state from the states DB, but not the associated object. Consider using @link{$deleteState} instead */
    $delState(id: string, options?: any): Promise<void>;
    /** Read a value (which might not belong to this adapter) from the states DB. */
    $getForeignState(id: string, options?: any): Promise<ioBroker.State>;
    /** Writes a value (which might not belong to this adapter) into the states DB. */
    $setForeignState(id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any): Promise<string>;
    /** Writes a value (which might not belong to this adapter) into the states DB, but only if it has changed. */
    $setForeignStateChanged(id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any): Promise<string>;
    $createOwnState(id: string, initialValue: any, ack?: boolean, commonType?: ioBroker.CommonType): Promise<void>;
    $createOwnStateEx(id: string, obj: ioBroker.Object, initialValue: any, ack?: boolean): Promise<void>;
    /**
     * Sends a message to a specific instance or all instances of some specific adapter.
     * @param instanceName The instance to send this message to.
     * If the ID of an instance is given (e.g. "admin.0"), only this instance will receive the message.
     * If the name of an adapter is given (e.g. "admin"), all instances of this adapter will receive it.
     * @param command (optional) Command name of the target instance. Default: "send"
     * @param message The message (e.g. params) to send.
     */
    $sendTo(instanceName: string, message: string | object): Promise<any>;
    $sendTo(instanceName: string, command: string, message: string | object): Promise<any>;
}
export declare class Global {
    static readonly loglevels: Readonly<{
        off: number;
        on: number;
        ridiculous: number;
    }>;
    static readonly severity: Readonly<{
        normal: number;
        warn: number;
        error: number;
    }>;
    private static _adapter;
    static adapter: ExtendedAdapter;
    private static _objectCache;
    static objectCache: ObjectCache;
    private static _loglevel;
    static loglevel: number;
    static extend(adapter: ioBroker.Adapter): ExtendedAdapter;
    static log(message: string, level?: ioBroker.LogLevel): void;
    /**
     * Kurzschreibweise für die Ermittlung eines Objekts
     * @param id
     */
    static $(id: string): Promise<ioBroker.Object>;
    /**
     * Kurzschreibweise für die Ermittlung mehrerer Objekte
     * @param id
     */
    static $$(pattern: string, type: ioBroker.ObjectType, role?: string): Promise<Record<string, ioBroker.Object>>;
    static isdef(value: any): boolean;
    static subscribeStates: (pattern: string | RegExp, callback: (id: string, state: ioBroker.State) => void) => string;
    static unsubscribeStates: (id: string) => void;
    static subscribeObjects: (pattern: string | RegExp, callback: (id: string, object: ioBroker.Object) => void) => string;
    static unsubscribeObjects: (id: string) => void;
    static ensureInstanceObjects(): Promise<void>;
}
