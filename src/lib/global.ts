import { entries, filter as objFilter } from "alcalzone-shared/objects";
import * as fs from "fs";
import * as path from "path";
import { ObjectCache } from "./object-cache";

// ==================================

const colors = {
	red: "#db3340",
	yellow: "#ffa200",
	green: "#5bb12f",
	blue: "#0087cb",
};

type Replacer = (substring: string, ...args: any[]) => string;

const replacements: {
	[id: string]: [RegExp, string | Replacer];
} = {
	bold: [/\*{2}(.*?)\*{2}/g, "<b>$1</b>"],
	italic: [/#{2}(.*?)#{2}/g, "<i>$1</i>"],
	underline: [/_{2}(.*?)_{2}/g, "<u>$1</u>"],
	strikethrough: [/\~{2}(.*?)\~{2}/g, "<s>$1</s>"],
	color: [/\{{2}(\w+)\|(.*?)\}{2}/, (str, p1: keyof typeof colors, p2) => {
		const color = colors[p1];
		if (!color) return str;

		return `<span style="color: ${color}">${p2}</span>`;
	}],
	fullcolor: [/^\{{2}(\w+)\}{2}(.*?)$/, (str, p1: keyof typeof colors, p2) => {
		const color = colors[p1];
		if (!color) return str;

		return `<span style="color: ${color}">${p2}</span>`;
	}],
};

export class Global {

	public static readonly loglevels = Object.freeze({ off: 0, on: 1, ridiculous: 2 });
	public static readonly severity = Object.freeze({ normal: 0, warn: 1, error: 2 });

	private static _adapter: ioBroker.Adapter;
	public static get adapter(): ioBroker.Adapter { return Global._adapter; }
	public static set adapter(adapter: ioBroker.Adapter) {
		Global._adapter = adapter;
	}

	private static _objectCache: ObjectCache;
	public static get objectCache(): ObjectCache { return Global._objectCache; }
	public static set objectCache(cache: ObjectCache) {
		Global._objectCache = cache;
	}

	private static _loglevel = Global.loglevels.on;
	public static get loglevel() { return Global._loglevel; }
	public static set loglevel(value) { Global._loglevel = value; }

	/*
		Formatierungen:
		**fett**, ##kursiv##, __unterstrichen__, ~~durchgestrichen~~
		schwarz{{farbe|bunt}}schwarz, {{farbe}}bunt
	*/
	public static log(message: string, level: ioBroker.LogLevel = "info") {
		if (!Global.adapter) return;

		if (message) {
			// Farben und Formatierungen
			for (const [/*key*/, [regex, repl]] of entries(replacements)) {
				message = message.replace(regex, repl as any);
			}
		}

		if (level === "silly" && !(level in Global._adapter.log)) level = "debug";
		Global._adapter.log[level](message);
	}

	/**
	 * Kurzschreibweise für die Ermittlung eines Objekts
	 * @param id
	 */
	public static $(id: string) {
		return Global._adapter.getForeignObjectAsync(id);
	}

	/**
	 * Kurzschreibweise für die Ermittlung mehrerer Objekte
	 * @param id
	 */
	public static async $$(pattern: string, type: ioBroker.ObjectType, role?: string) {
		const objects = await Global._adapter.getForeignObjectsAsync(pattern, type);
		if (role) {
			return objFilter(objects, o => o.common.role === role);
		} else {
			return objects;
		}
	}

	// Prüfen auf (un)defined
	public static isdef(value: any): boolean { return value != undefined; }

	// custom subscriptions
	public static subscribeStates: (pattern: string | RegExp, callback: (id: string, state: ioBroker.State) => void) => string;
	public static unsubscribeStates: (id: string) => void;
	public static subscribeObjects: (pattern: string | RegExp, callback: (id: string, object: ioBroker.Object) => void) => string;
	public static unsubscribeObjects: (id: string) => void;

	// Workaround für unvollständige Adapter-Upgrades
	public static async ensureInstanceObjects(): Promise<void> {
		// read io-package.json
		const ioPack = JSON.parse(
			fs.readFileSync(path.join(__dirname, "../../io-package.json"), "utf8"),
		);

		if (ioPack.instanceObjects == null || ioPack.instanceObjects.length === 0) return;

		// wait for all instance objects to be created
		const setObjects = ioPack.instanceObjects.map(
			obj => Global._adapter.setObjectNotExistsAsync(obj._id, obj),
		);
		await Promise.all(setObjects);
	}
}
