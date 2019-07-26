/// <reference types="iobroker" />
export declare class ObjectCache {
    private expiryDuration;
    /**
     * @param expiryDuration The timespan after which cached objects are expired automatically
     */
    constructor(expiryDuration?: number | false);
    private cache;
    private expireTimestamps;
    private expireTimer;
    /**
     * Retrieves an object from the cache or queries the database if it is not cached yet
     * @param id The id of the object to retrieve
     */
    getObject(id: string): Promise<ioBroker.Object | undefined>;
    objectExists(id: string): Promise<boolean>;
    private storeObject;
    private retrieveObject;
    private rememberForExpiry;
    private expire;
    private setTimerForNextExpiry;
    /**
     * Causes the cache for an object to be invalidated
     * @param id The id of the object to invalidate
     */
    invalidateObject(id: string): void;
    /**
     * Updates an object in the cache
     * @param id The id of the object to update
     * @param obj The updated object
     */
    updateObject(obj: ioBroker.Object): void;
    dispose(): void;
}
