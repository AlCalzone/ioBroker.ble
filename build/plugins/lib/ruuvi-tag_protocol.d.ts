/// <reference types="node" />
export interface RuuviContext {
    dataFormat: number;
    temperature?: number;
    humidity?: number;
    pressure?: number;
    acceleration?: {
        x: number;
        y: number;
        z: number;
    };
    battery?: number;
    txPower?: number;
    movementCounter?: number;
    sequenceNumber?: number;
    macAddress?: string;
    beaconID?: number;
}
export declare function parseDataFormat2or4(data: Buffer): RuuviContext;
export declare function parseDataFormat3(data: Buffer): RuuviContext;
export declare function parseDataFormat5(data: Buffer): RuuviContext;
