import type { CompareResult } from "alcalzone-shared/comparable";
import { extend } from "alcalzone-shared/objects";
import { SortedList } from "alcalzone-shared/sorted-list";
import { Global as _ } from "./global";

interface ExpireTimestamp {
	timestamp: number;
	id: string;
}
function compareExpireTimestamp(
	a: ExpireTimestamp,
	b: ExpireTimestamp,
): CompareResult {
	return Math.sign(b.timestamp - a.timestamp) as CompareResult;
}

export class ObjectCache {
	/**
	 * @param expiryDuration The timespan after which cached objects are expired automatically
	 */
	constructor(private expiryDuration: number | false = false) {}

	private cache = new Map<string, ioBroker.Object>();
	private expireTimestamps = new SortedList<ExpireTimestamp>(
		undefined,
		compareExpireTimestamp,
	);
	private expireTimer: NodeJS.Timer | undefined;

	/**
	 * Retrieves an object from the cache or queries the database if it is not cached yet
	 * @param id The id of the object to retrieve
	 */
	public async getObject(id: string): Promise<ioBroker.Object | undefined> {
		if (!this.cache.has(id)) {
			// retrieve the original object from the DB
			const ret = await _.adapter.getForeignObjectAsync(id);
			// and remember it in the cache
			if (ret != null) this.storeObject(ret);
		}
		return this.retrieveObject(id);
	}

	public async objectExists(id: string): Promise<boolean> {
		if (this.cache.has(id)) return true;
		// Try to retrieve the original object from the DB
		const ret = await _.adapter.getForeignObjectAsync(id);
		return ret != undefined;
	}

	private storeObject(obj: ioBroker.Object) {
		const clone = extend({}, obj) as ioBroker.Object;
		this.cache.set(clone._id, clone);
		this.rememberForExpiry(clone._id);
	}

	private retrieveObject(id: string): ioBroker.Object | undefined {
		if (this.cache.has(id)) {
			return extend({}, this.cache.get(id)!) as ioBroker.Object;
		}
	}

	private rememberForExpiry(id: string) {
		if (typeof this.expiryDuration !== "number") return;

		const existingTimestamp = [...this.expireTimestamps].find(
			(ets) => ets.id === id,
		);
		if (existingTimestamp != null) {
			this.expireTimestamps.remove(existingTimestamp);
		}
		const newTimestamp: ExpireTimestamp = {
			timestamp: Date.now() + this.expiryDuration,
			id,
		};
		this.expireTimestamps.add(newTimestamp);
		// if no expiry timer is running, start one
		if (this.expireTimer == null) {
			this.expireTimer = setTimeout(
				() => this.expire(),
				this.expiryDuration,
			);
		}
	}

	private expire() {
		this.expireTimer = undefined;
		if (this.expireTimestamps.length === 0) return;

		const nextTimestamp = this.expireTimestamps.peekStart()!;
		const timeDelta = nextTimestamp.timestamp - Date.now();
		if (timeDelta <= 0) {
			// it has expired
			this.invalidateObject(nextTimestamp.id);
			this.expireTimestamps.remove(nextTimestamp);
		}
		this.setTimerForNextExpiry();
	}

	private setTimerForNextExpiry() {
		if (this.expireTimestamps.length === 0) return;

		const nextTimestamp = this.expireTimestamps.peekStart()!;
		const timeDelta = nextTimestamp.timestamp - Date.now();
		this.expireTimer = setTimeout(
			() => this.expire(),
			Math.max(timeDelta, 100),
		);
	}

	/**
	 * Causes the cache for an object to be invalidated
	 * @param id The id of the object to invalidate
	 */
	public invalidateObject(id: string): void {
		this.cache.delete(id);
	}

	/**
	 * Updates an object in the cache
	 * @param id The id of the object to update
	 * @param obj The updated object
	 */
	public updateObject(obj: ioBroker.Object): void {
		this.storeObject(obj);
	}

	public dispose(): void {
		if (this.expireTimer != undefined) {
			clearTimeout(this.expireTimer);
			this.expireTimer = undefined;
		}
		this.cache.clear();
	}
}
