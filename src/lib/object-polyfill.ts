import { composeObject, entries } from "alcalzone-shared/objects";

// Gräbt in einem Objekt nach dem Property-Pfad.
// Bsps: (obj, "common.asdf.qwer") => obj.common.asdf.qwer
export function dig<T = any>(object: Record<string, T>, path: string) {
	function _dig(obj: T | Record<string, T>, pathArr: string[]) {
		// are we there yet? then return obj
		if (!pathArr.length) return obj;
		// go deeper
		let propName: string | number = pathArr.shift();
		if (/\[\d+\]/.test(propName)) {
			// this is an array index
			propName = +propName.slice(1, -1);
		}
		return _dig(obj[propName], pathArr);
	}
	return _dig(object, path.split("."));
}

// Vergräbt eine Eigenschaft in einem Objekt (Gegenteil von dig)
export function bury<T = any>(object: Record<string, T>, path: string, value: any) {
	function _bury(obj: T | Record<string, T>, pathArr: string[]) {
		// are we there yet? then return obj
		if (pathArr.length === 1) {
			obj[pathArr[0]] = value;
			return;
		}
		// go deeper
		let propName: string | number = pathArr.shift();
		if (/\[\d+\]/.test(propName)) {
			// this is an array index
			propName = +propName.slice(1, -1);
		}
		_bury(obj[propName], pathArr);
	}
	_bury(object, path.split("."));
}

export function stripUndefinedProperties<T = any>(obj: Record<string, T>): Record<string, T> {
	return composeObject(
		entries(obj)
			.filter(([key, value]) => value != null),
	);
}
