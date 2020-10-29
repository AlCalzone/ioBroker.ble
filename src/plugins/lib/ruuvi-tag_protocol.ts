import { stripUndefinedProperties } from "../../lib/object-polyfill";

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

export function parseDataFormat2or4(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	const humidity = data.readUInt8(1) * 0.5;

	const temperature = data.readInt8(2);

	const pressure = (data.readUInt16BE(4) + 50000) / 100; // hPa

	const ret: RuuviContext = {
		dataFormat,
		humidity,
		temperature,
		pressure,
	};
	if (dataFormat === 4 && data.length >= 6) {
		ret.beaconID = data[6];
	}
	return ret;
}

export function parseDataFormat3(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	const humidity = data.readUInt8(1) * 0.5;

	const temperature = data.readInt8(2) + data[3] / 100;

	const pressure = (data.readUInt16BE(4) + 50000) / 100; // hPa

	const acceleration = {
		x: data.readInt16BE(6),
		y: data.readInt16BE(8),
		z: data.readInt16BE(10),
	};

	const battery = data.readUInt16BE(12) / 1000; // mV -> V

	return {
		dataFormat,
		humidity,
		temperature,
		pressure,
		acceleration,
		battery,
	};
}

export function parseDataFormat5(data: Buffer): RuuviContext {
	const dataFormat = data[0];

	let temperature: number | undefined = data.readInt16BE(1);
	temperature = temperature !== 0x8000 ? temperature * 0.005 : undefined;

	let humidity: number | undefined = data.readUInt16BE(3);
	humidity = humidity !== 0xffff ? humidity * 0.0025 : undefined;

	let pressure: number | undefined = data.readUInt16BE(5);
	pressure = pressure !== 0xffff ? (pressure + 50000) / 100 : undefined; // hPa

	let acceleration:
		| { [key in "x" | "y" | "z"]: number | undefined }
		| undefined = {
		x: data.readInt16BE(7),
		y: data.readInt16BE(9),
		z: data.readInt16BE(11),
	};
	acceleration.x =
		acceleration.x !== 0x8000 ? acceleration.x! * 0.001 : undefined;
	acceleration.y =
		acceleration.y !== 0x8000 ? acceleration.y! * 0.001 : undefined;
	acceleration.z =
		acceleration.z !== 0x8000 ? acceleration.z! * 0.001 : undefined;
	if (
		acceleration.x == undefined &&
		acceleration.y == undefined &&
		acceleration.z == undefined
	)
		acceleration = undefined;

	const power = data.readUInt16BE(13);
	let battery: number | undefined;
	let txPower: number | undefined;
	if (power >>> 5 !== 0b111_1111_1111) battery = (power >>> 5) * 0.001 + 1.6;
	if ((power & 0b11111) !== 0b11111) txPower = (power & 0b11111) * 2 - 40;

	let movementCounter: number | undefined = data[15];
	if (movementCounter === 0xff) movementCounter = undefined;

	let sequenceNumber: number | undefined = data.readUInt16BE(16);
	if (sequenceNumber === 0xffff) sequenceNumber = undefined;

	let macAddress: string | undefined = data.slice(18, 24).toString("hex");
	if (macAddress === "ffffffffffff") macAddress = undefined;

	return (stripUndefinedProperties({
		dataFormat,
		temperature,
		humidity,
		pressure,
		acceleration,
		battery,
		txPower,
		movementCounter,
		sequenceNumber,
		macAddress,
	}) as any) as RuuviContext;
}
