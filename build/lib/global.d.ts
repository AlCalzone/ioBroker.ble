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
    static get adapter(): ioBroker.Adapter;
    static set adapter(adapter: ioBroker.Adapter);
    private static _objectCache;
    static get objectCache(): ObjectCache;
    static set objectCache(cache: ObjectCache);
    private static _loglevel;
    static get loglevel(): number;
    static set loglevel(value: number);
    static log(message: string, level?: ioBroker.LogLevel): void;
    /**
     * Kurzschreibweise für die Ermittlung eines Objekts
     * @param id
     */
    static $(id: string): ioBroker.GetObjectPromise;
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
