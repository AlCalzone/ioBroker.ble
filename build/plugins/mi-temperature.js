"use strict";
var global_1 = require("../lib/global");

const FRAME_CONTROL = {
	MAC_INCLUDE: 0b10000,
	CAPABILITY_INCLUDE: 0b100000,
	EVENT_INCLUDE: 0b1000000,
};

const EVENT_ID = {
	4106: (buffer, offset) => ({bat: buffer.readUInt8(offset)}), // BATTERY
	4109: (buffer, offset) => ({
		tmp: buffer.readUInt16LE(offset) / 10,
		hum: buffer.readUInt16LE(offset + 2) /10,
	}), // TEMP_HUM
	4102: (buffer, offset) => ({hum: buffer.readUInt16LE(offset) /10}), // HUM
	4100: (buffer, offset) => ({tmp: buffer.readUInt16LE(offset) /10}), // TEMP
};

function readServiceData(data) {
	if (data.length < 5) return null;
	const buff = Buffer.from(data);
	const result = {};
	let offset = 0;

	const frameControl = ((buff.readUInt8(1) << 8) + buff.readUInt8(0));
	result.productId = buff.readUInt16LE(2);
	result.counter = buff.readUInt8(4);

	offset = 5;

	result.frameControl = Object.keys(FRAME_CONTROL).map(id => {
		return (FRAME_CONTROL[id] & frameControl) && id;
	}).filter(Boolean);

	if (frameControl & FRAME_CONTROL.MAC_INCLUDE) {
		if (data.length < offset + 6) return null;
		result.mac = buff.toString('hex', offset, offset + 5);
		offset += 6;
	}

	if (frameControl & FRAME_CONTROL.CAPABILITY_INCLUDE) {
		if (data.length < offset + 1) return null;
		result.capability = buff.readUInt8(offset);
		offset++;
	}

	if (frameControl & FRAME_CONTROL.EVENT_INCLUDE) {
		if (data.length < offset + 3) return null;
		result.event = readEventData(buff, offset);
	}

	return result;
}

function readEventData(buffer, offset = 0) {
	const eventID = buffer.readUInt16LE(offset);
	const length = buffer.readUInt8(offset + 2);
	let data;

	if (EVENT_ID[eventID] && buffer.length >= (offset + 3 + length)) {
		data = EVENT_ID[eventID](buffer, offset + 3);
	}

	return {
		eventID, length,
		raw: buffer.toString('hex', offset + 3, (offset + 3 + length)),
		data,
	}
}

var plugin = {
    name: "Mi-Temperature",
    description: "Xiaomi Mi Temperatursensor",
    advertisedServices: ["fe95"],
    isHandling: function (p) {
        if (!p.address.toLowerCase().startsWith("4c:65:a8"))
            return false;
        for (var _i = 0, _a = p.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (entry.uuid === "fe95")
                return true;
        }
        return false;
    },
    defineObjects: function (peripheral) {
        var deviceObject = {
            common: null,
            native: null,
        };

        var stateObjects = [
            {
                id: "battery",
                common: {
                    role: "value",
                    name: "Battery",
                    type: "number",
                    unit: "%",
                    read: true,
                    write: false,
                },
                native: null,
            },
            {
                id: "humidity",
                common: {
                    role: "value",
                    name: "Humidity",
                    desc: "Humidity",
                    type: "number",
                    unit: "%",
                    read: true,
                    write: false,
                },
                native: null,
            },
            {
                id: "temperature",
                common: {
                    role: "value",
                    name: "Temperature",
                    type: "number",
                    unit: "°C",
                    read: true,
                    write: false,
                },
                native: null,
            },
        ];
        return {
            device: deviceObject,
            channels: null,
            states: stateObjects,
        };
    },
    getValues: function (peripheral) {
        var data, temperature, humidity;
		var ret = {};
		
		const {advertisement, id, rssi, address} = peripheral;
		const {localName, serviceData, serviceUuids} = advertisement;
		let xiaomiData = null;

		for (let i in serviceData) {
			if (serviceData[i].uuid.toString('hex') === 'fe95') {
				xiaomiData = serviceData[i].data;
			}
		}
		xiaomiData = readServiceData(xiaomiData);

		global_1.Global.log("mi-temperature >> xiaomiData: " + JSON.stringify(xiaomiData["event"]["data"]), "debug");
		
		var data = xiaomiData["event"]["data"];
		if(data.hasOwnProperty("hum")) {
			ret["humidity"] = data["hum"];
		}
		if(data.hasOwnProperty("tmp")) {
			ret["temperature"] = data["tmp"];
		}
		if(data.hasOwnProperty("bat")) {
			ret["battery"] = data["bat"];
		}

        return ret;
    },
};
module.exports = plugin;

