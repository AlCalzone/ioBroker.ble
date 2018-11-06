export interface CustomStateSubscription {
    pattern: RegExp;
    callback: (id: string, state: ioBroker.State | null | undefined) => void;
}
export interface CustomObjectSubscription {
    pattern: RegExp;
    callback: (id: string, obj: ioBroker.Object | null | undefined) => void;
}
export declare function applyCustomStateSubscriptions(id: string, state: ioBroker.State | null | undefined): void;
export declare function applyCustomObjectSubscriptions(id: string, obj: ioBroker.Object | null | undefined): void;
/**
 * Subscribe to some ioBroker states
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
export declare function subscribeStates(pattern: string | RegExp, callback: (id: string, state: ioBroker.State) => void): string;
/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeStates}
 */
export declare function unsubscribeStates(id: string): void;
/**
 * Subscribe to some ioBroker objects
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
export declare function subscribeObjects(pattern: string | RegExp, callback: (id: string, object: ioBroker.Object) => void): string;
/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeObjects}
 */
export declare function unsubscribeObjects(id: string): void;
/** Clears all custom subscriptions */
export declare function clearCustomSubscriptions(): void;
