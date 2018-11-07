import { Global as _ } from "./global";
import { str2regex } from "./str2regex";

export interface CustomStateSubscription {
	pattern: RegExp;
	callback: (id: string, state: ioBroker.State | null | undefined) => void;
}
export interface CustomObjectSubscription {
	pattern: RegExp;
	callback: (id: string, obj: ioBroker.Object | null | undefined) => void;
}
const customStateSubscriptions: {
	subscriptions: Map<string, CustomStateSubscription>,
	counter: number,
} = {
		subscriptions: new Map(),
		counter: 0,
	};
const customObjectSubscriptions: {
	subscriptions: Map<string, CustomObjectSubscription>,
	counter: number,
} = {
		subscriptions: new Map(),
		counter: 0,
	};

/**
 * Ensures the subscription pattern is valid
 */
function checkPattern(pattern: string | RegExp): RegExp | undefined {
	try {
		if (typeof pattern === "string") {
			return str2regex(pattern);
		} else if (pattern instanceof RegExp) {
			return pattern;
		} else {
			// NOPE
			throw new Error("The pattern must be regex or string");
		}
	} catch (e) {
		_.log("cannot subscribe with this pattern. reason: " + e, "error");
	}
}

export function applyCustomStateSubscriptions(id: string, state: ioBroker.State | null | undefined) {
	try {
		for (const sub of customStateSubscriptions.subscriptions.values()) {
			if (
				sub
				&& sub.pattern
				&& sub.pattern.test(id)
				&& typeof sub.callback === "function"
			) {
				// Wenn die ID zum aktuellen Pattern passt, dann Callback aufrufen
				sub.callback(id, state);
			}
		}
	} catch (e) {
		_.log("error handling custom sub: " + e);
	}
}

export function applyCustomObjectSubscriptions(id: string, obj: ioBroker.Object | null | undefined) {
	try {
		for (const sub of customObjectSubscriptions.subscriptions.values()) {
			if (
				sub
				&& sub.pattern
				&& sub.pattern.test(id)
				&& typeof sub.callback === "function"
			) {
				// Wenn die ID zum aktuellen Pattern passt, dann Callback aufrufen
				sub.callback(id, obj);
			}
		}
	} catch (e) {
		_.log("error handling custom sub: " + e);
	}
}

/**
 * Subscribe to some ioBroker states
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
export function subscribeStates(pattern: string | RegExp, callback: (id: string, state: ioBroker.State) => void): string | undefined {

	const checkedPattern = checkPattern(pattern);
	if (checkedPattern == undefined) return;

	const newCounter = (++customStateSubscriptions.counter);
	const id = "" + newCounter;

	customStateSubscriptions.subscriptions.set(id, { pattern: checkedPattern, callback });

	return id;
}

/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeStates}
 */
export function unsubscribeStates(id: string) {
	if (customStateSubscriptions.subscriptions.has(id)) {
		customStateSubscriptions.subscriptions.delete(id);
	}
}

/**
 * Subscribe to some ioBroker objects
 * @param pattern
 * @param callback
 * @returns a subscription ID
 */
export function subscribeObjects(pattern: string | RegExp, callback: (id: string, object: ioBroker.Object) => void): string | undefined {

	const checkedPattern = checkPattern(pattern);
	if (checkedPattern == undefined) return;

	const newCounter = (++customObjectSubscriptions.counter);
	const id = "" + newCounter;

	customObjectSubscriptions.subscriptions.set(id, { pattern: checkedPattern, callback });

	return id;
}

/**
 * Release the custom subscription with the given id
 * @param id The subscription ID returned by @link{subscribeObjects}
 */
export function unsubscribeObjects(id: string) {
	if (customObjectSubscriptions.subscriptions.has(id)) {
		customObjectSubscriptions.subscriptions.delete(id);
	}
}

/** Clears all custom subscriptions */
export function clearCustomSubscriptions() {
	customStateSubscriptions.subscriptions.clear();
	customObjectSubscriptions.subscriptions.clear();
}
