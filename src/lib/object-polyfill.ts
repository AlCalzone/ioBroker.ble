import { composeObject, entries } from "alcalzone-shared/objects";

export function stripUndefinedProperties<T = any>(obj: Record<string, T>): Record<string, T> {
	return composeObject(
		entries(obj)
			.filter(([key, value]) => value != null),
	);
}
