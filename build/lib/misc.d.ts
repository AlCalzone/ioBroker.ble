/** Returns a subset of `obj` that contains only the given keys */
export declare function pick<T extends Record<any, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
