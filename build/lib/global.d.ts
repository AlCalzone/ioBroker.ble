/// <reference types="iobroker" />
import type { ObjectCache } from "./object-cache";
export declare class Global {
    private static _adapter;
    static get adapter(): ioBroker.Adapter;
    static set adapter(adapter: ioBroker.Adapter);
    private static _objectCache;
    static get objectCache(): ObjectCache;
    static set objectCache(cache: ObjectCache);
    /**
     * Kurzschreibweise für die Ermittlung mehrerer Objekte
     * @param id
     */
    static $$(pattern: string, type: ioBroker.ObjectType, role?: string): Promise<Record<string, ioBroker.Object>>;
    static ensureInstanceObjects(): Promise<void>;
}
