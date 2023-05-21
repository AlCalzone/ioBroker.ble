/*!
 * Plugin for Switchbot devices using the 0d00 characteristic
 */

import { Global as _ } from "../lib/global";
import type { PeripheralInfo } from "../lib/scanProcessInterface";
import type {
	DeviceObjectDefinition,
	Plugin,
	StateObjectDefinition,
} from "./plugin";
import { ChannelObjectDefinition, getServiceData } from "./plugin";

const serviceUUID = "0d00";

interface SwitchbotContext {
	peripheral?: PeripheralInfo;
	data?: Buffer;
	battery?: number;
	switchState?: number;
	mode?: number;
}

const plugin: Plugin<SwitchbotContext> = {
	name: "Switchbot",
	description: "Switchbot devices",

	advertisedServices: [serviceUUID],

	isHandling: (p) => {
		// If the peripheral has no serviceData with UUID 0d00, this is not for us
		if (
			!p.advertisement ||
			!p.advertisement.serviceData ||
			!p.advertisement.serviceData.some((entry) => entry.uuid === "0d00")
		)
			return false;

		// If the peripheral has no manufacturerData, this is not for us
		if (!p.advertisement || !p.advertisement.manufacturerData) return false;

		// Switch on p.advertisement.serviceData.data.data
		for (const entry of p.advertisement.serviceData) {
			if (entry.data) {
				const data = entry.data;
				// Look if the data is a valid Switchbot advertisement
				switch (data[0]) {
					case 0x48: // SwitchBot Bot (WoHand)
						return true;
				}
			}
		}
		return false;
	},

	createContext: (peripheral: PeripheralInfo) => {
		const data = getServiceData(peripheral, serviceUUID);
		if (data === undefined) return;

		// _.adapter.log.info(`Switchbot >> got data: ${data.toString("hex")}`);

		return parseData(data);
	},

	defineObjects: (context: SwitchbotContext) => {
		if (context == undefined) return;

		const deviceObject: DeviceObjectDefinition = {
			// no special definitions neccessary
			common: undefined,
			native: undefined,
		};

		const channelObjects: ChannelObjectDefinition[] = [
			{
				id: "control",
				common: {
					// common
					name: {
						en: "Control the device",
						de: "Gerät steuern",
						fr: "Contrôler l'appareil",
						nl: "Apparaat bedienen",
						ru: "Управление устройством",
						pt: "Controlar o dispositivo",
						es: "Controlar el dispositivo",
						pl: "Kontroluj urządzenie",
						"zh-cn": "控制设备",
						uk: "Контроль пристрою",
					},
				},
				native: undefined,
			},
		];

		const stateObjects: StateObjectDefinition[] = [
			{
				id: "control.up",
				common: {
					role: "button",
					name: "Up",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Lift the arm of the Switchbot. Press mode only.",
						de: "Den Arm des Switchbot anheben. Nur Druckmodus.",
						fr: "Soulevez le bras du Switchbot. Mode presse uniquement.",
						nl: "Til de arm van de Switchbot op. Alleen drukmodus.",
						ru: "Поднимите руку Switchbot. Режим нажатия только.",
						pt: "Levante o braço do Switchbot. Modo de imprensa apenas.",
						es: "Levante el brazo del Switchbot. Modo de prensa solamente.",
						pl: "Podnieś ramię Switchbot. Tylko tryb prasy.",
						"zh-cn": "举起Switchbot的手臂. 仅按压模式.",
						uk: "Підніміть руку Switchbot. Тільки режим натискання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.down",
				common: {
					role: "button",
					name: "Down",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Lower the arm of the Switchbot. Press mode only.",
						de: "Den Arm des Switchbot absenken. Nur Druckmodus.",
						fr: "Abaissez le bras du Switchbot. Mode presse uniquement.",
						nl: "Laat de arm van de Switchbot zakken. Alleen drukmodus.",
						ru: "Опустите руку Switchbot. Режим нажатия только.",
						pt: "Baixe o braço do Switchbot. Modo de imprensa apenas.",
						es: "Baje el brazo del Switchbot. Modo de prensa solamente.",
						pl: "Obniż ramię Switchbot. Tylko tryb prasy.",
						"zh-cn": "降低Switchbot的手臂. 仅按压模式.",
						uk: "Опустіть руку Switchbot. Тільки режим натискання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.press",
				common: {
					role: "button",
					name: "Press",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Lower the arm of the Switchbot and lift it again. Press mode only.",
						de: "Den Arm des Switchbot absenken und wieder anheben. Nur Druckmodus.",
						fr: "Abaissez le bras du Switchbot et soulevez-le à nouveau. Mode presse uniquement.",
						nl: "Laat de arm van de Switchbot zakken en til hem weer op. Alleen drukmodus.",
						ru: "Опустите руку Switchbot и снова поднимите ее. Режим нажатия только.",
						pt: "Baixe o braço do Switchbot e levante-o novamente. Modo de imprensa apenas.",
						es: "Baje el brazo del Switchbot y levántelo de nuevo. Modo de prensa solamente.",
						pl: "Obniż ramię Switchbot i podnieś je ponownie. Tylko tryb prasy.",
						"zh-cn":
							"降低Switchbot的手臂，然后再次抬起. 仅按压模式.",
						uk: "Опустіть руку Switchbot і знову підніміть її. Тільки режим натискання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.on",
				common: {
					role: "button",
					name: "ON",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Turn the switch on. Switch mode only.",
						de: "Schalten Sie den Schalter ein. Nur Schaltmodus.",
						fr: "Allumez l'interrupteur. Mode de commutation uniquement.",
						nl: "Zet de schakelaar aan. Alleen schakelmodus.",
						ru: "Включите переключатель. Режим переключения только.",
						pt: "Ligue o interruptor. Modo de comutação apenas.",
						es: "Encienda el interruptor. Solo modo de interruptor.",
						pl: "Włącz przełącznik. Tylko tryb przełączania.",
						"zh-cn": "打开开关. 仅切换模式.",
						uk: "Увімкніть перемикач. Тільки режим перемикання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.off",
				common: {
					role: "button",
					name: "OFF",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Turn the switch off. Switch mode only.",
						de: "Schalten Sie den Schalter aus. Nur Schaltmodus.",
						fr: "Éteignez l'interrupteur. Mode de commutation uniquement.",
						nl: "Zet de schakelaar uit. Alleen schakelmodus.",
						ru: "Выключите переключатель. Режим переключения только.",
						pt: "Desligue o interruptor. Modo de comutação apenas.",
						es: "Apague el interruptor. Solo modo de interruptor.",
						pl: "Wyłącz przełącznik. Tylko tryb przełączania.",
						"zh-cn": "关闭开关. 仅切换模式.",
						uk: "Вимкніть перемикач. Тільки режим перемикання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.inverse",
				common: {
					role: "switch",
					name: "Inverse",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Inverse ON/OFF control. Switch mode only.",
						de: "Invertiere EIN / AUS-Steuerung. Nur Schaltmodus.",
						fr: "Contrôle inverse ON / OFF. Mode de commutation uniquement.",
						nl: "Inverse AAN / UIT-bediening. Alleen schakelmodus.",
						ru: "Инвертировать управление ВКЛ / ВЫКЛ. Режим переключения только.",
						pt: "Controle inverso LIGADO / DESLIGADO. Modo de comutação apenas.",
						es: "Control inverso ON / OFF. Solo modo de interruptor.",
						pl: "Odwróć sterowanie WŁĄCZ / WYŁĄCZ. Tylko tryb przełączania.",
						"zh-cn": "反向ON / OFF控制. 仅切换模式.",
						uk: "Інвертувати управління ВКЛ / ВИКЛ. Тільки режим перемикання.",
					},
				},
				native: undefined,
			},
			{
				id: "control.mode",
				common: {
					role: "state",
					name: {
						en: "Mode of the Switchbot",
						de: "Modus des Switchbot",
						fr: "Mode du Switchbot",
						nl: "Modus van de Switchbot",
						ru: "Режим Switchbot",
						pt: "Modo do Switchbot",
						es: "Modo del Switchbot",
						pl: "Tryb Switchbot",
						"zh-cn": "Switchbot的模式",
						uk: "Режим Switchbot",
					},
					desc: {
						en: "0: Switch mode = On and Off. 1: Press mode = Single press.",
						de: "0: Schaltmodus = Ein und Aus. 1: Druckmodus = Einzelklick.",
						fr: "0: Mode de commutation = Marche et arrêt. 1: Mode de pression = Appui simple.",
						nl: "0: Schakelmodus = Aan en uit. 1: Drukmodus = Enkele druk.",
						ru: "0: Режим переключения = Вкл. и Выкл. 1: Режим нажатия = Одиночное нажатие.",
						pt: "0: Modo de comutação = Ligado e desligado. 1: Modo de pressão = Pressão única.",
						es: "0: Modo de conmutación = Encendido y apagado. 1: Modo de presión = Pulsación única.",
						pl: "0: Tryb przełączania = Włącz i wyłącz. 1: Tryb nacisku = Naciśnięcie jednego przycisku.",
						"zh-cn": "0：切换模式=打开和关闭。 1：按下模式=单击。",
						uk: "0: Режим перемикання = Увімкнено і Вимкнено. 1: Режим натискання = Одиночне натискання.",
					},
					type: "number",
					read: true,
					write: true,
					def: 0,
					states: {
						0: "Press",
						1: "Switch",
					},
				},
				native: undefined,
			},
			{
				id: "battery",
				common: {
					role: "value",
					name: "Battery",
					desc: {
						en: "Battery level of the device",
						de: "Batteriestand des Geräts",
						fr: "Niveau de batterie de l'appareil",
						nl: "Batterijniveau van het apparaat",
						ru: "Уровень заряда аккумулятора устройства",
						pt: "Nível de bateria do dispositivo",
						es: "Nivel de batería del dispositivo",
						pl: "Poziom naładowania baterii urządzenia",
						"zh-cn": "设备的电池电量",
						uk: "Рівень заряду акумулятора пристрою",
					},
					type: "number",
					unit: "%",
					read: true,
					write: false,
					def: 0,
				},
				native: undefined,
			},
			{
				id: "switchState",
				common: {
					role: "button",
					name: "Switch state",
					type: "boolean",
					read: false,
					write: true,
					def: false,
					desc: {
						en: "Represents the state of the switch. True = On, False = Off",
						de: "Stellt den Zustand des Schalters dar. True = Ein, False = Aus",
						fr: "Représente l'état du commutateur. True = On, False = Off",
						nl: "Vertegenwoordigt de staat van de schakelaar. True = Aan, False = Uit",
						ru: "Представляет состояние переключателя. True = Вкл, False = Выкл",
						pt: "Representa o estado do interruptor. True = On, False = Off",
						es: "Representa el estado del interruptor. True = On, False = Off",
						pl: "Przedstawia stan przełącznika. True = On, False = Off",
						"zh-cn": "表示开关的状态。 True = On，False = Off",
						uk: "Представляє стан перемикача. True = Вкл, False = Вимкн.",
					},
				},
				native: undefined,
			},
		];

		return {
			device: deviceObject,
			channels: channelObjects,
			states: stateObjects,
		};
	},

	getValues: (context: SwitchbotContext) => {
		if (context == null) return;

		//_.adapter.log.info(`getValues: ${context.mode}`);

		const ret = {
			switchState: context.switchState === 1,
			battery: context.battery,
			"control.mode": context.mode,
		};

		return ret;
	},

	stateChange: async (context: SwitchbotContext) => {
		_.adapter.log.info(`stateChange: ${context.toString()}`);
		_.adapter.on("stateChange", async (id, state) => {
			_.adapter.log.info(`stateChange: ${id} ${state?.val}`);
		});
	},
};

function parseData(data: Buffer): SwitchbotContext {
	const result: Record<string, any> = {};
	// Bit 7 of byte 1 is the mode
	result.mode = data[1] & 0x80;
	// Bit 6 to 0 of byte 1 is the switch state
	result.switchState = data[1] & 0x7f;
	// Bit 4 of byte 1 is data commit flag
	result.dataCommit = data[1] & 0x10;
	// Bit 3 of byte 1 represents group D
	result.groupD = data[1] & 0x08;
	// Bit 2 of byte 1 represents group C
	result.groupC = data[1] & 0x04;
	// Bit 1 of byte 1 represents group B
	result.groupB = data[1] & 0x02;
	// Bit 0 of byte 1 represents group A
	result.groupA = data[1] & 0x01;
	// Bit 6 to 0 of byte 2 is the battery level
	result.battery = data[2] & 0x7f;
	// Bit 7 of byte 2 is the Sync UTC flag
	result.syncUtc = data[2] & 0x80;

	return result;
}

export = plugin as Plugin;
