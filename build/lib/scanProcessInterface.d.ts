/// <reference types="iobroker" />
export declare enum ScanExitCodes {
    RequireNobleFailed = 1
}
export declare type ScanMessage = {
    type: "error";
    error: Error;
} | {
    type: "fatal";
    error: Error;
} | {
    type: "connected";
} | {
    type: "disconnected";
} | {
    type: "driverState";
    driverState: string;
} | {
    type: "log";
    message: string;
    level?: ioBroker.LogLevel;
} | {
    type: "discover";
};
