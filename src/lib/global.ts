import { DictionaryLike, entries, filter as objFilter } from "./object-polyfill";
import { promisify, promisifyNoError } from "./promises";

// ==================================

const colors = {
	red: "#db3340",
	yellow: "#ffa200",
	green: "#5bb12f",
	blue: "#0087cb",
};

const replacements: {
	[id: string]: [RegExp, string | ((substring: string, ...args: any[]) => string)];
} = {
	bold: [/\*{2}(.*?)\*{2}/g, "<b>$1</b>"],
	italic: [/#{2}(.*?)#{2}/g, "<i>$1</i>"],
	underline: [/_{2}(.*?)_{2}/g, "<u>$1</u>"],
	strikethrough: [/\~{2}(.*?)\~{2}/g, "<s>$1</s>"],
	color: [/\{{2}(\w+)\|(.*?)\}{2}/, (str, p1, p2) => {
		const color = colors[p1];
		if (!color) return str;

		return `<span style="color: ${color}">${p2}</span>`;
	}],
	fullcolor: [/^\{{2}(\w+)\}{2}(.*?)$/, (str, p1, p2) => {
		const color = colors[p1];
		if (!color) return str;

		return `<span style="color: ${color}">${p2}</span>`;
	}],
};

export interface ExtendedAdapter extends ioBroker.Adapter {
	__isExtended: boolean;

	$getObject: (id: string, options?: any) => Promise<ioBroker.Object>;
	$getAdapterObjects: () => Promise<{ [id: string]: ioBroker.Object }>;
	$setObject: (id: string, obj: ioBroker.Object, options?: any) => Promise<{ id: string }>;
	$getForeignObject: (id: string, options?: any) => Promise<ioBroker.Object>;
	$setForeignObject: (id: string, obj: ioBroker.Object, options?: any) => Promise<{ id: string }>;
	$getForeignObjects: (pattern: string, type?: ioBroker.ObjectType, enums?: ioBroker.EnumList, options?: any) => Promise<{ [id: string]: ioBroker.Object }>;

	$createDevice: (deviceName: string, common?: ioBroker.ObjectCommon, native?: any, options?: any) => Promise<{ id: string }>;
	$deleteDevice: (deviceName: string, options?: any) => Promise<void>;
	$createChannel: (parentDevice: string, channelName: string, roleOrCommon?: string | ioBroker.ChannelCommon, native?: any, options?: any) => Promise<{ id: string }>;
	$deleteChannel: (parentDevice: string, channelName: string, options?: any) => Promise<void>;

	$getState: (id: string, options?: any) => Promise<ioBroker.State>;
	$getStates: (pattern: string, options?: any) => Promise<{ [id: string]: ioBroker.State }>;
	$setState: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;
	$setStateChanged: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;
	$createState: (parentDevice: string, parentChannel: string, stateName: string, roleOrCommon?: string | ioBroker.StateCommon, native?: any, options?: any) => Promise<{ id: string }>;
	$deleteState: (parentDevice: string, parentChannel: string, stateName: string, options?: any) => Promise<void>;

	$getForeignState: (id: string, options?: any) => Promise<ioBroker.State>;
	$setForeignState: (id: string, state: string | number | boolean | ioBroker.State, ack?: boolean, options?: any) => Promise<string>;

	$createOwnState: (id: string, initialValue: any, ack?: boolean, commonType?: ioBroker.CommonType) => Promise<void>;
	$createOwnStateEx: (id: string, obj: ioBroker.Object, initialValue: any, ack?: boolean) => Promise<void>;

	$sendTo: (instanceName: string, command: string, message: string | object) => Promise<any>;
}

export class Global {

	public static readonly loglevels = Object.freeze({ off: 0, on: 1, ridiculous: 2 });
	public static readonly severity = Object.freeze({ normal: 0, warn: 1, error: 2 });

	private static _adapter: ExtendedAdapter;
	public static get adapter(): ExtendedAdapter { return Global._adapter; }
	public static set adapter(adapter: ExtendedAdapter) {
		Global._adapter = adapter;
	}

	private static _loglevel = Global.loglevels.on;
	public static get loglevel() { return Global._loglevel; }
	public static set loglevel(value) { Global._loglevel = value; }

	public static extend(adapter: ioBroker.Adapter): ExtendedAdapter {
		// Eine Handvoll Funktionen promisifizieren

		let ret = adapter as ExtendedAdapter;
		if (!ret.__isExtended) {
			ret.objects.$getObjectList = promisify(adapter.objects.getObjectList, adapter.objects);
			ret = Object.assign(ret, {
				$getObject: promisify<ioBroker.Object>(adapter.getObject, adapter),
				$setObject: promisify<{ id: string }>(adapter.setObject, adapter),
				$getAdapterObjects: promisify<{ [id: string]: ioBroker.Object }>(adapter.getAdapterObjects, adapter),

				$getForeignObject: promisify<ioBroker.Object>(adapter.getForeignObject, adapter),
				$setForeignObject: promisify<{ id: string }>(adapter.setForeignObject, adapter),
				$getForeignObjects: promisify<{ [id: string]: ioBroker.Object }>(adapter.getForeignObjects, adapter),

				$createDevice: promisify<{ id: string }>(adapter.createDevice, adapter),
				$deleteDevice: promisify<void>(adapter.deleteDevice, adapter),
				$createChannel: promisify<{ id: string }>(adapter.createChannel, adapter),
				$deleteChannel: promisify<void>(adapter.deleteChannel, adapter),

				$getState: promisify<ioBroker.State>(adapter.getState, adapter),
				$getStates: promisify<{ [id: string]: ioBroker.State }>(adapter.getStates, adapter),
				$setState: promisify<string>(adapter.setState, adapter),
				$setStateChanged: promisify<string>(adapter.setStateChanged, adapter),
				$createState: promisify<{ id: string }>(adapter.createState, adapter),
				$deleteState: promisify<void>(adapter.deleteState, adapter),

				$getForeignState: promisify<ioBroker.State>(adapter.getForeignState, adapter),
				$setForeignState: promisify<string>(adapter.setForeignState, adapter),

				$sendTo: promisifyNoError<any>(adapter.sendTo, adapter),
			});
		}
		ret.$createOwnState = async (id: string, initialValue: any, ack: boolean = true, commonType: ioBroker.CommonType = "mixed") => {
			await ret.$setObject(id, {
				type: "state",
				common: {
					name: id,
					role: "value",
					type: commonType,
					read: true,
					write: true,
				},
				native: {},
			});
			if (initialValue != undefined) await ret.$setState(id, initialValue, ack);
		};
		ret.$createOwnStateEx = async (id: string, obj: ioBroker.Object, initialValue: any, ack = true) => {
			await ret.$setObject(id, obj);
			if (initialValue != undefined) await ret.$setState(id, initialValue, ack);
		};

		return ret;
	}

	/*
		Formatierungen:
		**fett**, ##kursiv##, __unterstrichen__, ~~durchgestrichen~~
		schwarz{{farbe|bunt}}schwarz, {{farbe}}bunt
	*/
	public static log(message: string, {level = Global.loglevels.on, severity = Global.severity.normal} = {}) {
		if (!Global.adapter) return;
		if (level < Global._loglevel) return;

		// Warnstufe auswählen
		let logFn;
		switch (severity) {
			case Global.severity.warn:
				logFn = "warn";
				break;
			case Global.severity.error:
				logFn = "error";
				break;
			case Global.severity.normal:
			default:
				logFn = "info";
		}

		if (message) {
			// Farben und Formatierungen
			for (const [/*key*/, [regex, repl]] of entries(replacements)) {
				if (typeof repl === "string") {
					message = message.replace(regex, repl);
				} else { // a bit verbose, but TS doesn't get the overload thingy here
					message = message.replace(regex, repl);
				}
			}
		}

		Global._adapter.log[logFn](message);
	}

	/**
	 * Kurzschreibweise für die Ermittlung eines Objekts
	 * @param id
	 */
	public static async $(id: string) {
		return await Global._adapter.$getForeignObject(id);
	}

	/**
	 * Kurzschreibweise für die Ermittlung mehrerer Objekte
	 * @param id
	 */
	public static async $$(pattern: string, type: ioBroker.ObjectType, role?: string) {
		const objects = await Global._adapter.$getForeignObjects(pattern, type);
		if (role) {
			return objFilter(objects, o => (o.common as any).role === role);
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
}
