/// <reference types="iobroker" />
import type { Peripheral } from "@abandonware/noble";
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
    peripheral: PeripheralInfo;
};
export declare type PeripheralInfo = Pick<Peripheral, "id" | "uuid" | "address" | "addressType" | "connectable" | "advertisement" | "rssi" | "services" | "state">;
export declare function getMessageReviver<T extends Record<string, any>>(callback: (message: T) => void): (input: Record<string, any>) => void;
