// fake import so we can augment the global scope
import fs = require("fs");

declare global {
	namespace BLE {

		/** Contains information advertised BLE data */
		interface Advertisement {
			/** The name of the broadcasting device */
			localName?: string;
			txPowerLevel?: number;
			/** List of services UUIDs this device offers */
			serviceUuids: string[];
			/** List of services UUIDs this device would like to consume */
			serviceSolicitationUuids: string[];
			/** Manufacturer specific data */
			manufacturerData?: Buffer;
			/** Dictionary of advertised service data */
			serviceData?: {
				uuid: string,
				data: Buffer,
			}[];
		}

		/** Contains information about a BLE peripheral */
		interface Peripheral {
			/** ID of this device */
			id: string;
			/** Bluetooth Address of device, or 'unknown' if not known */
			address: string;
			/** Bluetooth Address type (public, random), or 'unknown' if not known  */
			addressType: "public" | "random" | "unknown";
			/** If the device can be connected to */
			connectable: boolean;
			/** Advertised data */
			advertisement?: Advertisement;
			/** Signal strength of the device */
			rssi: number;
			state?: "disconnected" | "connected";
		}
	}
}
