export declare function dig<T = any>(object: Record<string, T>, path: string): any;
export declare function bury<T = any>(object: Record<string, T>, path: string, value: any): void;
export declare function stripUndefinedProperties<T = any>(obj: Record<string, T>): Record<string, T>;
