export declare type PromiseCallback = (value: any) => {} | PromiseLike<any>;
export declare function promisify<T>(fn: any, context: any): (...args: any[]) => Promise<T>;
export declare function promisifyNoError<T>(fn: any, context: any): (...args: any[]) => Promise<T>;
export declare function waterfall(...fn: PromiseCallback[]): Promise<any>;
