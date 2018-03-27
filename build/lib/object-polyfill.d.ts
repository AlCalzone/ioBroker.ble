export declare type Predicate<T> = (value: T) => boolean;
export declare type KeyValuePair<T> = [string, T];
/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj Das Objekt, dessen Eigenschaften als Key-Value-Pair iteriert werden sollen
 */
export declare function entries<T>(obj: Record<string, T>): KeyValuePair<T>[];
/**
 * Stellt einen Polyfill für Object.values bereit
 * @param obj Das Objekt, dessen Eigenschaftswerte iteriert werden sollen
 */
export declare function values<T>(obj: Record<string, T>): T[];
/**
 * Gibt ein Subset eines Objekts zurück, dessen Eigenschaften einem Filter entsprechen
 * @param obj Das Objekt, dessen Eigenschaften gefiltert werden sollen
 * @param predicate Die Filter-Funktion, die auf Eigenschaften angewendet wird
 */
export declare function filter<T>(obj: Record<string, T>, predicate: Predicate<T>): Record<string, T>;
/**
 * Kombinierte mehrere Key-Value-Paare zu einem Objekt
 * @param properties Die Key-Value-Paare, die zu einem Objekt kombiniert werden sollen
 */
export declare function composeObject<T = any>(properties: KeyValuePair<T>[]): Record<string, T>;
export declare function dig<T = any>(object: Record<string, T>, path: string): any;
export declare function bury<T = any>(object: Record<string, T>, path: string, value: any): void;
export declare function extend(target: any, source: any): any;
