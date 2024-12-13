export class QingpingEvent {
	temperature: number;
	humidity: number;
	battery: number;

	constructor(temp: number, hum: number, batt: number) {
		this.temperature = temp;
		this.humidity = hum;
		this.battery = batt;
	}
}
interface FieldDefinition {
	name: string;
	offset: number;
	length: number;
	type: string;
	scale?: number;
}

interface Schema {
	fields: FieldDefinition[];
}

const fields = [
	{ name: "mac", offset: 2, length: 6, type: "mac" },
	{ name: "temperature", offset: 10, length: 2, type: "int16", scale: 0.1 },
	{ name: "humidity", offset: 12, length: 2, type: "uint16", scale: 0.1 },
	{ name: "battery", offset: 16, length: 1, type: "uint8" },
];

const schema: Schema = { fields };

export class QingpingAdvertisement {
	public constructor(data: Buffer) {
		if (!data || data.length < 17) {
			throw new Error(
				"A Qingping advertisement frame must be at least 17 bytes long",
			);
		}
		const record = this.decodeMessage(data, schema);
		if (record.mac) this._macAddress = record.mac;
		if (record.temperature && record.humidity && record.battery){
			this._hasEvent = true;
			this._event = new QingpingEvent(
				record.temperature,
				record.humidity,
				record.battery,
			);
		}
	}

	private _event: QingpingEvent | undefined;
	public get event(): QingpingEvent | undefined {
		return this._event;
	}

	private _hasEvent: boolean = false;
	public get hasEvent(): boolean {
		return this._hasEvent;
	}

	private _macAddress: string | undefined;
	public get macAddress(): string | undefined {
		return this._macAddress;
	}

	private decodeMessage(buffer: Buffer, schema: Schema): Record<string, any> {
		const result: Record<string, any> = {};

		schema.fields.forEach((field) => {
			const { name, offset, length, type, scale } = field;
			let value: any;

			switch (type) {
				case "uint8":
					value = buffer.readUInt8(offset);
					break;
				case "int16":
					value = buffer.readInt16LE(offset);
					break;
				case "uint16":
					value = buffer.readUInt16LE(offset);
					break;
				case "hex":
					value = buffer
						.slice(offset, offset + length)
						.toString("hex");
					break;
				case "mac":
					const macBytes = buffer
						.slice(offset, offset + length)
						.reverse();
					value = Array.from(macBytes)
						.map((byte) => byte.toString(16).padStart(2, "0"))
						.join(":"); // Format as colon-separated MAC address
					break;
				default:
					throw new Error(`Unsupported field type: ${type}`);
			}

			if (scale) {
				value = Math.round(value * scale * 10) / 10;
			}

			result[name] = value;
		});

		return result;
	}
}
