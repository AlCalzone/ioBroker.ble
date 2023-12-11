interface BTHomeMultilevelSensorDefinition {
	id: number;
	label: string;
	signed: boolean;
	size: number;
	factor?: number;
	unit?: string;
}

export interface BTHomeMultilevelSensorData {
	label: string;
	value: number;
	unit?: string;
}

const multilevelSensorsArray: BTHomeMultilevelSensorDefinition[] = [
	{
		id: 0x51,
		label: "acceleration",
		signed: false,
		size: 2,
		factor: 0.001,
		unit: "m/s²",
	},
	{
		id: 0x01,
		label: "battery",
		signed: false,
		size: 1,
		unit: "%",
	},
	{
		id: 0x12,
		label: "co2",
		signed: false,
		size: 2,
		unit: "ppm",
	},
	{ id: 0x09, label: "count", signed: false, size: 1 },
	{ id: 0x3d, label: "count", signed: false, size: 2 },
	{ id: 0x3e, label: "count", signed: false, size: 4 },
	{
		id: 0x43,
		label: "current",
		signed: false,
		size: 2,
		factor: 0.001,
		unit: "A",
	},
	{
		id: 0x08,
		label: "dewpoint",
		signed: true,
		size: 2,
		factor: 0.01,
		unit: "°C",
	},
	{
		id: 0x40,
		label: "distance (mm)",
		signed: false,
		size: 2,
		unit: "mm",
	},
	{
		id: 0x41,
		label: "distance (m)",
		signed: false,
		size: 2,
		factor: 0.1,
		unit: "m",
	},
	{
		id: 0x42,
		label: "duration",
		signed: false,
		size: 3,
		factor: 0.001,
		unit: "s",
	},
	{
		id: 0x4d,
		label: "energy",
		signed: false,
		size: 4,
		factor: 0.001,
		unit: "kWh",
	},
	{
		id: 0x0a,
		label: "energy",
		signed: false,
		size: 3,
		factor: 0.001,
		unit: "kWh",
	},
	{
		id: 0x4b,
		label: "gas",
		signed: false,
		size: 3,
		factor: 0.001,
		unit: "m3",
	},
	{
		id: 0x4c,
		label: "gas",
		signed: false,
		size: 4,
		factor: 0.001,
		unit: "m3",
	},
	{
		id: 0x52,
		label: "gyroscope",
		signed: false,
		size: 2,
		factor: 0.001,
		unit: "°/s",
	},
	{
		id: 0x03,
		label: "humidity",
		signed: false,
		size: 2,
		factor: 0.01,
		unit: "%",
	},
	{
		id: 0x2e,
		label: "humidity",
		signed: false,
		size: 1,
		unit: "%",
	},
	{
		id: 0x05,
		label: "illuminance",
		signed: false,
		size: 3,
		factor: 0.01,
		unit: "lux",
	},
	{
		id: 0x06,
		label: "mass (kg)",
		signed: false,
		size: 2,
		factor: 0.01,
		unit: "kg",
	},
	{
		id: 0x07,
		label: "mass (lb)",
		signed: false,
		size: 2,
		factor: 0.01,
		unit: "lb",
	},
	{
		id: 0x14,
		label: "moisture",
		signed: false,
		size: 2,
		factor: 0.01,
		unit: "%",
	},
	{
		id: 0x2f,
		label: "moisture",
		signed: false,
		size: 1,
		unit: "%",
	},
	{
		id: 0x0d,
		label: "pm2.5",
		signed: false,
		size: 2,
		unit: "ug/m3",
	},
	{
		id: 0x0e,
		label: "pm10",
		signed: false,
		size: 2,
		unit: "ug/m3",
	},
	{
		id: 0x0b,
		label: "power",
		signed: false,
		size: 3,
		factor: 0.01,
		unit: "W",
	},
	{
		id: 0x04,
		label: "pressure",
		signed: false,
		size: 3,
		factor: 0.01,
		unit: "hPa",
	},
	{
		id: 0x3f,
		label: "rotation",
		signed: true,
		size: 2,
		factor: 0.1,
		unit: "°",
	},
	{
		id: 0x44,
		label: "speed",
		signed: false,
		size: 2,
		factor: 0.01,
		unit: "m/s",
	},
	{
		id: 0x45,
		label: "temperature",
		signed: true,
		size: 2,
		factor: 0.1,
		unit: "°C",
	},
	{
		id: 0x02,
		label: "temperature",
		signed: true,
		size: 2,
		factor: 0.01,
		unit: "°C",
	},
	{
		id: 0x13,
		label: "tvoc",
		signed: false,
		size: 2,
		unit: "ug/m3",
	},
	{
		id: 0x0c,
		label: "voltage",
		signed: false,
		size: 2,
		factor: 0.001,
		unit: "V",
	},
	{
		id: 0x4a,
		label: "voltage",
		signed: false,
		size: 2,
		factor: 0.1,
		unit: "V",
	},
	{
		id: 0x4e,
		label: "volume",
		signed: false,
		size: 4,
		factor: 0.001,
		unit: "L",
	},
	{
		id: 0x47,
		label: "volume",
		signed: false,
		size: 2,
		factor: 0.1,
		unit: "L",
	},
	{
		id: 0x48,
		label: "volume",
		signed: false,
		size: 2,
		unit: "mL",
	},
	{
		id: 0x49,
		label: "volume Flow Rate",
		signed: false,
		size: 2,
		factor: 0.001,
		unit: "m3/hr",
	},
	{
		id: 0x46,
		label: "UV index",
		signed: false,
		size: 1,
		factor: 0.1,
	},
	{
		id: 0x4f,
		label: "water",
		signed: false,
		size: 4,
		factor: 0.001,
		unit: "L",
	},
];

const multilevelSensorDefinitions = new Map<
	number,
	BTHomeMultilevelSensorDefinition
>(multilevelSensorsArray.map((def) => [def.id, def] as const));

interface BTHomeBinarySensorDefinition {
	id: number;
	label: string;
	states: {
		true: string;
		false: string;
	};
}

export interface BTHomeBinarySensorData {
	label: string;
	value: boolean;
	states: {
		true: string;
		false: string;
	};
}

const binarySensorsArray: BTHomeBinarySensorDefinition[] = [
	{ id: 0x15, label: "battery", states: { false: "Normal", true: "Low" } },
	{
		id: 0x16,
		label: "battery charging",
		states: { false: "Not Charging", true: "Charging" },
	},
	{
		id: 0x17,
		label: "carbon monoxide",
		states: { false: "Not detected", true: "Detected" },
	},
	{ id: 0x18, label: "cold", states: { false: "Normal", true: "Cold" } },
	{
		id: 0x19,
		label: "connectivity",
		states: { false: "Disconnected", true: "Connected" },
	},
	{ id: 0x1a, label: "door", states: { false: "Closed", true: "Open" } },
	{
		id: 0x1b,
		label: "garage door",
		states: { false: "Closed", true: "Open" },
	},
	{ id: 0x1c, label: "gas", states: { false: "Clear", true: "Detected" } },
	{
		id: 0x0f,
		label: "generic boolean",
		states: { false: "Off", true: "On" },
	},
	{ id: 0x1d, label: "heat", states: { false: "Normal", true: "Hot" } },
	{
		id: 0x1e,
		label: "light",
		states: { false: "No light", true: "Light detected" },
	},
	{ id: 0x1f, label: "lock", states: { false: "Locked", true: "Unlocked" } },
	{ id: 0x20, label: "moisture", states: { false: "Dry", true: "Wet" } },
	{ id: 0x21, label: "motion", states: { false: "Clear", true: "Detected" } },
	{
		id: 0x22,
		label: "moving",
		states: { false: "Not moving", true: "Moving" },
	},
	{
		id: 0x23,
		label: "occupancy",
		states: { false: "Clear", true: "Detected" },
	},
	{ id: 0x11, label: "opening", states: { false: "Closed", true: "Open" } },
	{
		id: 0x24,
		label: "plug",
		states: { false: "Unplugged", true: "Plugged in" },
	},
	{ id: 0x10, label: "power", states: { false: "Off", true: "On" } },
	{ id: 0x25, label: "presence", states: { false: "Away", true: "Home" } },
	{ id: 0x26, label: "problem", states: { false: "OK", true: "Problem" } },
	{
		id: 0x27,
		label: "running",
		states: { false: "Not Running", true: "Running" },
	},
	{ id: 0x28, label: "safety", states: { false: "Unsafe", true: "Safe" } },
	{ id: 0x29, label: "smoke", states: { false: "Clear", true: "Detected" } },
	{ id: 0x2a, label: "sound", states: { false: "Clear", true: "Detected" } },
	{ id: 0x2b, label: "tamper", states: { false: "Off", true: "On" } },
	{
		id: 0x2c,
		label: "vibration",
		states: { false: "Clear", true: "Detected" },
	},
	{ id: 0x2d, label: "window", states: { false: "Closed", true: "Open" } },
];

const binarySensorDefinitions = new Map<number, BTHomeBinarySensorDefinition>(
	binarySensorsArray.map((def) => [def.id, def] as const),
);

export type BTHomeEvent =
	| {
			type: "button";
			event?:
				| "press" // 0x01
				| "double_press" // 0x02
				| "triple_press" // 0x03
				| "long_press" // 0x04
				| "long_double_press" // 0x05
				| "long_triple_press"; // 0x06
	  }
	| {
			type: "dimmer";
			event?:
				| {
						event: "rotate left"; // 0x01
						steps: number;
				  }
				| {
						event: "rotate left"; // 0x02
						steps: number;
				  };
	  };

export type SpecialSensors =
	| {
			type: "timestamp";
			value: Date;
	  }
	| {
			type: "text";
			value: string;
	  }
	| {
			type: "raw";
			value: Buffer;
	  };

export class BTHomeAdvertisement {
	public constructor(data: Buffer) {
		if (!data || data.length < 1) {
			throw new Error(
				"A BTHome v2 advertisement frame must be at least 1 byte long",
			);
		}

		const btHomeInfoByte = data[0];
		this.encrypted = !!(btHomeInfoByte & 0b1);
		this.triggerBased = !!(btHomeInfoByte & 0b100);
		this.btHomeVersion = btHomeInfoByte >>> 5;

		if (this.btHomeVersion === 1) {
			throw new Error("BTHome v1 is not yet supported by this plugin");
		} else if (this.encrypted) {
			throw new Error(
				"Encrypted BTHome advertisements are not yet supported by this plugin",
			);
		}

		data = data.slice(1);

		const multilevelSensors: BTHomeMultilevelSensorData[] = [];
		const binarySensors: BTHomeBinarySensorData[] = [];
		const specialSensors: SpecialSensors[] = [];
		const events: BTHomeEvent[] = [];

		while (data.length > 0) {
			const objectId = data[0];
			if (objectId === 0x00) {
				this.packetId = data[1];
				data = data.slice(2);
			} else if (multilevelSensorDefinitions.has(objectId)) {
				const def = multilevelSensorDefinitions.get(objectId)!;
				let value = def.signed
					? data.readIntLE(1, def.size)
					: data.readUIntLE(1, def.size);
				if (def.factor) {
					value *= def.factor;
				}
				const sensorData: BTHomeMultilevelSensorData = {
					label: def.label,
					value,
				};
				if (def.unit) {
					sensorData.unit = def.unit;
				}
				multilevelSensors.push(sensorData);

				data = data.slice(1 + def.size);
			} else if (binarySensorDefinitions.has(objectId)) {
				const def = binarySensorDefinitions.get(objectId)!;
				const sensorData: BTHomeBinarySensorData = {
					label: def.label,
					value: data[1] === 0x01,
					states: def.states,
				};
				binarySensors.push(sensorData);

				data = data.slice(2);
			} else if (objectId === 0x3a) {
				// button event
				const eventId = data[1];

				const event: BTHomeEvent = {
					type: "button",
				};
				if (eventId !== 0x00) {
					event.event = (
						[
							"press",
							"double_press",
							"triple_press",
							"long_press",
							"long_double_press",
							"long_triple_press",
						] as const
					)[eventId - 1];
				}
				events.push(event);

				data = data.slice(2);
			} else if (objectId === 0x3c) {
				// button event
				const eventId = data[1];

				const event: BTHomeEvent = {
					type: "dimmer",
				};
				if (eventId !== 0x00) {
					event.event = {
						// @ts-expect-error
						event: (["rotate left", "rotate right"] as const)[
							eventId - 1
						],
						steps: data[2],
					};
				}
				events.push(event);

				data = data.slice(3);
			} else if (objectId === 0x50) {
				// unix timestamp UTC
				const timestamp = data.readUInt32LE(1);
				specialSensors.push({
					type: "timestamp",
					value: new Date(timestamp * 1000),
				});
				data = data.slice(5);
			} else if (objectId === 0x53) {
				// text sensor (utf8)
				const length = data[1];
				const value = data.slice(2, 2 + length).toString("utf8");
				specialSensors.push({
					type: "text",
					value,
				});
				data = data.slice(2 + length);
			} else if (objectId === 0x54) {
				// raw sensor
				const length = data[1];
				const value = data.slice(2, 2 + length);
				specialSensors.push({
					type: "raw",
					value,
				});
				data = data.slice(2 + length);
			} else {
				throw new Error(
					`Unsupported BTHome object ID ${objectId.toString(16)}`,
				);
			}
		}

		this.multilevelSensors = multilevelSensors;
		this.binarySensors = binarySensors;
		this.events = events;
	}

	public readonly btHomeVersion: number;
	public readonly encrypted: boolean;
	public readonly triggerBased: boolean;

	public readonly packetId?: number;

	public readonly multilevelSensors: readonly BTHomeMultilevelSensorData[];
	public readonly binarySensors: readonly BTHomeBinarySensorData[];
	public readonly specialSensors: readonly SpecialSensors[] = [];
	public readonly events: readonly BTHomeEvent[] = [];
}
