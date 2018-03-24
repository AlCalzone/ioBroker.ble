// tslint:disable:max-classes-per-file

const enum FrameControlFlags {
	NewFactory = 1 << 0,
	Connected = 1 << 1,
	Central = 1 << 2,
	Encrypted = 1 << 3,
	MacAddress = 1 << 4,
	Capabilities = 1 << 5,
	Event = 1 << 6,
	CustomData = 1 << 7,
	Subtitle = 1 << 8,
	Binding = 1 << 9,
}

export enum CapabilityFlags {
	Connectable = 1 << 0,
	Central = 1 << 1,
	Encrypt = 1 << 2,
	IO = 1 << 3 | 1 << 4,
}

export enum ProductIDs {
	MiFlora = 0x0098,
	// the rest is unknown
}
// tslint:disable-next-line:variable-name
export const MacPrefixes: Record<keyof typeof ProductIDs, string> = Object.freeze({
	MiFlora: "c4:7c:8d",
	MiTemperature: "4c:65:a8",
});

export class XiaomiAdvertisement {

	public constructor(data: Buffer) {
		if (!data || data.length < 5) {
			throw new Error("A xiaomi advertisement frame must be at least 5 bytes long");
		}
		// 4 bit version, 12 bit flags
		const frameControl = data.readUInt16LE(0);
		this._version = frameControl >>> 12;
		const flags = frameControl & 0xfff;
		this._isNewFactory = (flags & FrameControlFlags.NewFactory) !== 0;
		this._isConnected = (flags & FrameControlFlags.Connected) !== 0;
		this._isCentral = (flags & FrameControlFlags.Central) !== 0;
		this._isEncrypted = (flags & FrameControlFlags.Encrypted) !== 0;
		this._hasMacAddress = (flags & FrameControlFlags.MacAddress) !== 0;
		this._hasCapabilities = (flags & FrameControlFlags.Capabilities) !== 0;
		this._hasEvent = (flags & FrameControlFlags.Event) !== 0;
		this._hasCustomData = (flags & FrameControlFlags.CustomData) !== 0;
		this._hasSubtitle = (flags & FrameControlFlags.Subtitle) !== 0;
		this._isBindingFrame = (flags & FrameControlFlags.Binding) !== 0;

		this._productID = data.readUInt16LE(2);

		this._frameCounter = data[4];

		// The actual packet content begins at offset 5
		let offset = 5;
		if (this._hasMacAddress) {
			this._macAddress = reverseBuffer(
				data.slice(offset, offset + 6),
			).toString("hex");
			offset += 6;
		}

		if (this._hasCapabilities) {
			this._capabilities = data[offset];
			offset++;
		}

		if (this._hasEvent) {
			const eventID = data.readUInt16LE(offset);
			const eventName = XiaomiEventIDs_Internal[eventID] as keyof typeof XiaomiEventIDs_Internal;
			const dataLength = data[offset + 2];
			const eventData = data.slice(offset + 3, offset + 3 + dataLength);
			const numericData = parseNumberLE(eventData);
			// check if there's a specialized value transform
			if (XiaomiEventIDs_Internal[eventID] in valueTransforms) {
				this._event = valueTransforms[XiaomiEventIDs_Internal[eventID]](numericData);
			} else {
				this._event = valueTransforms.default(numericData, eventID);
			}
		}
	}

	private _productID: number;
	public get productID() {
		return this._productID;
	}

	private _version: number;
	public get version() {
		return this._version;
	}

	private _frameCounter: number;
	public get frameCounter() {
		return this._frameCounter;
	}

	private _isNewFactory: boolean;
	public get isNewFactory() {
		return this._isNewFactory;
	}

	private _isConnected: boolean;
	public get isConnected() {
		return this._isConnected;
	}

	private _isCentral: boolean;
	public get isCentral() {
		return this._isCentral;
	}

	private _isEncrypted: boolean;
	public get isEncrypted() {
		return this._isEncrypted;
	}

	private _hasMacAddress: boolean;
	public get hasMacAddress() {
		return this._hasMacAddress;
	}

	private _macAddress: string;
	public get macAddress() {
		return this._macAddress;
	}

	private _hasCapabilities: boolean;
	public get hasCapabilities() {
		return this._hasCapabilities;
	}

	private _capabilities: number;
	public get capabilities() {
		return this._capabilities;
	}

	private _hasEvent: boolean;
	public get hasEvent() {
		return this._hasEvent;
	}

	private _event: XiaomiEvent | undefined;
	public get event(): XiaomiEvent | undefined {
		return this._event;
	}

	private _hasCustomData: boolean;
	public get hasCustomData() {
		return this._hasCustomData;
	}

	private _customData: Buffer;
	public get customData() {
		return this._customData;
	}

	private _hasSubtitle: boolean;
	public get hasSubtitle() {
		return this._hasSubtitle;
	}

	private _isBindingFrame: boolean;
	public get isBindingFrame() {
		return this._isBindingFrame;
	}
}

export enum XiaomiEventIDs_Internal {
	Temperature = 0x1004, // temp = value / 10
	Humidity = 0x1006,    // humidity = value / 10
	Illuminance = 0x1007,
	Moisture = 0x1008,
	Fertility = 0x1009,
	Battery = 0x100A,
	TemperatureAndHumidity = 0x100D, // 1 byte temperature / 10, 1 byte humidity / 10
}

export type XiaomiEventIDs =
	"temperature"
	| "humidity"
	| "illuminance"
	| "moisture"
	| "fertility"
	| "battery"
;

export type XiaomiEvent = Partial<Record<XiaomiEventIDs, number>>;
type ValueTransform = (val: number, eventID?: XiaomiEventIDs_Internal) => XiaomiEvent;
// value transforms translate the internal data structure to the external one
// in most cases this is a 1:1 match
const valueTransforms: Partial<
	Record<
		keyof typeof XiaomiEventIDs_Internal,
		ValueTransform
	>
> & {"default": ValueTransform} = {
	// by default just pass the value through
	default: (val, eventID) => ({[XiaomiEventIDs_Internal[eventID].toLowerCase()]: val}),
	Temperature: (val) => ({temperature: val / 10}),
	Humidity: (val) => ({humidity: val / 10}),
	TemperatureAndHumidity: (val) => ({
		temperature: (val >>> 8) / 10,
		humidity: (val & 0xff) / 10,
	}),
};

function reverseBuffer(buf: Buffer): Buffer {
	const ret = Buffer.allocUnsafe(buf.length);
	for (let i = 0; i < buf.length; i++) {
		ret[i] = buf[buf.length - 1 - i];
	}
	return ret;
}

function parseNumberLE(buf: Buffer, offset: number = 0, length: number = buf.length): number {
	// read <length> bytes in LE order
	let value = 0;
	for (let i = offset + length - 1; i >= offset; i--) {
		value = (value << 8) + buf[i];
	}
	return value;
}
