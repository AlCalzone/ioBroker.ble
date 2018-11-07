/// <reference types="node" />
export declare enum CapabilityFlags {
    Connectable = 1,
    Central = 2,
    Encrypt = 4,
    IO = 24
}
export declare enum ProductIDs {
    MiFlora = 152
}
export declare const MacPrefixes: Record<keyof typeof ProductIDs, string>;
export declare class XiaomiAdvertisement {
    constructor(data: Buffer);
    private _productID;
    readonly productID: number;
    private _version;
    readonly version: number;
    private _frameCounter;
    readonly frameCounter: number;
    private _isNewFactory;
    readonly isNewFactory: boolean;
    private _isConnected;
    readonly isConnected: boolean;
    private _isCentral;
    readonly isCentral: boolean;
    private _isEncrypted;
    readonly isEncrypted: boolean;
    private _hasMacAddress;
    readonly hasMacAddress: boolean;
    private _macAddress;
    readonly macAddress: string | undefined;
    private _hasCapabilities;
    readonly hasCapabilities: boolean;
    private _capabilities;
    readonly capabilities: number | undefined;
    private _hasEvent;
    readonly hasEvent: boolean;
    private _event;
    readonly event: XiaomiEvent | undefined;
    private _hasCustomData;
    readonly hasCustomData: boolean;
    private _customData;
    readonly customData: Buffer | undefined;
    private _hasSubtitle;
    readonly hasSubtitle: boolean;
    private _isBindingFrame;
    readonly isBindingFrame: boolean;
}
export declare enum XiaomiEventIDs_Internal {
    Temperature = 4100,
    Humidity = 4102,
    Illuminance = 4103,
    Moisture = 4104,
    Fertility = 4105,
    Battery = 4106,
    TemperatureAndHumidity = 4109
}
export declare type XiaomiEventIDs = "temperature" | "humidity" | "illuminance" | "moisture" | "fertility" | "battery";
export declare type XiaomiEvent = Partial<Record<XiaomiEventIDs, number>>;
