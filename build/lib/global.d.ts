export interface ExtendedAdapter extends ioBroker.Adapter {
    __isExtended: boolean;
    $getObject: (id: string, options?: any) => Promise<ioBroker.Object>;
    $getAdapterObjects: () => Promise<{
        [id: string]: ioBroker.Object;
    }>;
    $setObject: (id: string, obj: ioBroker.Object, options?: any) => Promise<{
        id: string;
    }>;
    $getForeignObject: (id: string, options?: any) => Promise<ioBroker.Object>;
    $setForeignObject: (id: string, obj: ioBroker.Object, options?: any) => Promise<{
        id: string;
    }>;
    $getForeignObjects: (pattern: string, type?: ioBroker.ObjectType, enums?: ioBroker.EnumList, options?: any) => Promise<{
        [id: string]: ioBroker.Object;
    }>;
    $createDevice: (deviceName: string, common?: ioBroker.ObjectCommon, native?: any, options?: any) => Promise<{
        id: string;
    }>;
    $deleteDevice: (deviceName: string, options?: any) => Promise<void>;
    $createChannel: (parentDevice: string, channelName: string, roleOrCommon?: string | ioBroker.ChannelCommon, native?: any, options?: any) => Promise<{
        id: string;
    }>;
    $deleteChannel: (parentDevice: string, channelName: string, options?: any) => Promise<void>;
    $getState: (id: string, options?: any) => Promise<ioBroker.State>;
    $getStates: (pattern: string, options?: any) => Promise<{
        [id: string]: ioBroker.State;
    }>;
    $setState: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;
    $setStateChanged: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;
    $createState: (parentDevice: string, parentChannel: string, stateName: string, roleOrCommon?: string | ioBroker.StateCommon, native?: any, options?: any) => Promise<{
        id: string;
    }>;
    $deleteState: (parentDevice: string, parentChannel: string, stateName: string, options?: any) => Promise<void>;
    $getForeignState: (id: string, options?: any) => Promise<ioBroker.State>;
    $setForeignState: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;
    $createOwnState: (id: string, initialValue: any, ack?: boolean, commonType?: ioBroker.CommonType) => Promise<void>;
    $createOwnStateEx: (id: string, obj: ioBroker.Object, initialValue: any, ack?: boolean) => Promise<void>;
    $sendTo: (instanceName: string, command: string, message: string | object) => Promise<any>;
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
    private static _loglevel;
    static loglevel: number;
    static extend(adapter: ioBroker.Adapter): ExtendedAdapter;
    static log(message: string, {level, severity}?: {
        level?: number;
        severity?: number;
    }): void;
    /**
     * Kurzschreibweise für die Ermittlung eines Objekts
     * @param id
     */
    static $(id: string): Promise<ioBroker.Object>;
    /**
     * Kurzschreibweise für die Ermittlung mehrerer Objekte
     * @param id
     */
    static $$(pattern: string, type: ioBroker.ObjectType, role?: string): Promise<{
        [id: string]: ioBroker.Object;
    }>;
    static isdef(value: any): boolean;
    static subscribeStates: (pattern: string | RegExp, callback: (id: string, state: ioBroker.State) => void) => string;
    static unsubscribeStates: (id: string) => void;
    static subscribeObjects: (pattern: string | RegExp, callback: (id: string, object: ioBroker.Object) => void) => string;
    static unsubscribeObjects: (id: string) => void;
}
