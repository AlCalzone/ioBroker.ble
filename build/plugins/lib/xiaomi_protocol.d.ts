/// <reference types="node" />
export declare enum CapabilityFlags {
    Connectable = 1,
    Central = 2,
    Encrypt = 4,
    IO = 24
}
export declare enum XiaomiEventIDs_Internal {
    Temperature = 4100,
    KettleStatusAndTemperature = 4101,
    Humidity = 4102,
    Illuminance = 4103,
    Moisture = 4104,
    Fertility = 4105,
    Battery = 4106,
    TemperatureAndHumidity = 4109
}
export declare type XiaomiEventIDs = "temperature" | "humidity" | "illuminance" | "moisture" | "fertility" | "battery" | "kettleStatus";
export declare type XiaomiEvent = Partial<Record<XiaomiEventIDs, number>>;
export declare class XiaomiAdvertisement {
    constructor(data: Buffer);
    private _productID;
    get productID(): number;
    private _version;
    get version(): number;
    private _frameCounter;
    get frameCounter(): number;
    private _isNewFactory;
    get isNewFactory(): boolean;
    private _isConnected;
    get isConnected(): boolean;
    private _isCentral;
    get isCentral(): boolean;
    private _isEncrypted;
    get isEncrypted(): boolean;
    private _hasMacAddress;
    get hasMacAddress(): boolean;
    private _macAddress;
    get macAddress(): string | undefined;
    private _hasCapabilities;
    get hasCapabilities(): boolean;
    private _capabilities;
    get capabilities(): number | undefined;
    private _hasEvent;
    get hasEvent(): boolean;
    private _event;
    get event(): XiaomiEvent | undefined;
    private _hasCustomData;
    get hasCustomData(): boolean;
    private _customData;
    get customData(): Buffer | undefined;
    private _hasSubtitle;
    get hasSubtitle(): boolean;
    private _isBindingFrame;
    get isBindingFrame(): boolean;
}
