/// <reference types="iobroker" />
import { ObjectCache } from "./object-cache";
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
    static adapter: ioBroker.Adapter;
    private static _objectCache;
    static objectCache: ObjectCache;
    private static _loglevel;
    static loglevel: number;
    static log(message: string, level?: ioBroker.LogLevel): void;
    /**
     * Kurzschreibweise für die Ermittlung eines Objekts
     * @param id
     */
    static $(id: string): Promise<ioBroker.StateObject | ioBroker.ChannelObject | ioBroker.DeviceObject | ioBroker.OtherObject | null | undefined>;
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
