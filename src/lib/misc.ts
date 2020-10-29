/** Returns a subset of `obj` that contains only the given keys */
export function pick<T extends Record<any, any>, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const ret = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) ret[key] = obj[key];
	}
	return ret;
}
