import type { Peripheral } from "@abandonware/noble";
import { isArray, isObject } from "alcalzone-shared/typeguards";

export enum ScanExitCodes {
	RequireNobleFailed = 1,
}

export type ScanMessage =
	| {
			type: "error";
			error: Error;
	  }
	| {
			type: "fatal";
			error: Error;
	  }
	| {
			type: "connected";
	  }
	| {
			type: "disconnected";
	  }
	| {
			type: "driverState";
			driverState: string;
	  }
	| {
			type: "log";
			message: string;
			level?: ioBroker.LogLevel;
	  }
	| {
			type: "discover";
			peripheral: PeripheralInfo;
	  };

export type PeripheralInfo = Pick<
	Peripheral,
	| "id"
	| "uuid"
	| "address"
	| "addressType"
	| "connectable"
	| "advertisement"
	| "rssi"
	| "services"
	| "state"
>;

export function getMessageReviver<T extends Record<string, any>>(
	callback: (message: T) => void,
): (input: Record<string, any>) => void {
	const reviveValue = (value: any): any => {
		if (isArray(value)) {
			return value.map((v: any) => reviveValue(v));
		} else if (isObject(value)) {
			const v = value as any;
			if (v.type === "Buffer" && isArray(v.data)) {
				return Buffer.from(v.data);
			} else if (
				v.type === "Error" &&
				typeof v.name === "string" &&
				typeof v.message === "string"
			) {
				const ret = new Error(v.message);
				ret.name = v.name;
				ret.stack = v.stack;
				return ret;
			}
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			return reviveObject(value);
		} else {
			return value;
		}
	};
	const reviveObject = (input: Record<string, any>): Record<string, any> => {
		const ret: Record<string, any> = {};
		for (const [key, value] of Object.entries(input)) {
			ret[key] = reviveValue(value);
		}
		return ret;
	};

	return (input) => {
		callback(reviveObject(input) as T);
	};
}
