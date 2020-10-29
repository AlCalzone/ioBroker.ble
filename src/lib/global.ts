import { filter as objFilter } from "alcalzone-shared/objects";
import * as fs from "fs";
import * as path from "path";
import type { ObjectCache } from "./object-cache";

export class Global {
	private static _adapter: ioBroker.Adapter;
	public static get adapter(): ioBroker.Adapter {
		return Global._adapter;
	}
	public static set adapter(adapter: ioBroker.Adapter) {
		Global._adapter = adapter;
	}

	private static _objectCache: ObjectCache;
	public static get objectCache(): ObjectCache {
		return Global._objectCache;
	}
	public static set objectCache(cache: ObjectCache) {
		Global._objectCache = cache;
	}

	/**
	 * Kurzschreibweise für die Ermittlung mehrerer Objekte
	 * @param id
	 */
	public static async $$(
		pattern: string,
		type: ioBroker.ObjectType,
		role?: string,
	): Promise<Record<string, ioBroker.Object>> {
		const objects = await Global._adapter.getForeignObjectsAsync(
			pattern,
			type,
		);
		if (role) {
			return objFilter(objects, (o) => o.common.role === role);
		} else {
			return objects;
		}
	}

	// Workaround für unvollständige Adapter-Upgrades
	public static async ensureInstanceObjects(): Promise<void> {
		// read io-package.json
		const ioPack = JSON.parse(
			fs.readFileSync(
				path.join(__dirname, "../../io-package.json"),
				"utf8",
			),
		);

		if (
			ioPack.instanceObjects == null ||
			ioPack.instanceObjects.length === 0
		)
			return;

		// wait for all instance objects to be created
		const setObjects = (ioPack.instanceObjects as ioBroker.Object[]).map(
			(obj) => Global._adapter.setObjectNotExistsAsync(obj._id, obj),
		);
		await Promise.all(setObjects);
	}
}
