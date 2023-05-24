"use strict";
var import_global = require("../lib/global");
var import_plugin = require("./plugin");
/*!
 * Plugin for Switchbot devices using the 0d00 characteristic
 */
const serviceUUID = "0d00";
const plugin = {
  name: "Switchbot",
  description: "Switchbot devices",
  advertisedServices: [serviceUUID],
  isHandling: (p) => {
    if (!p.advertisement || !p.advertisement.serviceData || !p.advertisement.serviceData.some((entry) => entry.uuid === "0d00"))
      return false;
    if (!p.advertisement || !p.advertisement.manufacturerData)
      return false;
    for (const entry of p.advertisement.serviceData) {
      if (entry.data) {
        const data = entry.data;
        switch (data[0]) {
          case 72:
            return true;
        }
      }
    }
    return false;
  },
  createContext: (peripheral) => {
    const data = (0, import_plugin.getServiceData)(peripheral, serviceUUID);
    if (data === void 0)
      return;
    return parseData(data);
  },
  defineObjects: (context) => {
    if (context == void 0)
      return;
    const deviceObject = {
      common: void 0,
      native: void 0
    };
    const channelObjects = [
      {
        id: "control",
        common: {
          name: {
            en: "Control the device",
            de: "Ger\xE4t steuern",
            fr: "Contr\xF4ler l'appareil",
            nl: "Apparaat bedienen",
            ru: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u043E\u043C",
            pt: "Controlar o dispositivo",
            es: "Controlar el dispositivo",
            pl: "Kontroluj urz\u0105dzenie",
            "zh-cn": "\u63A7\u5236\u8BBE\u5907",
            uk: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E"
          }
        },
        native: void 0
      }
    ];
    const stateObjects = [
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
            ru: "\u041F\u043E\u0434\u043D\u0438\u043C\u0438\u0442\u0435 \u0440\u0443\u043A\u0443 Switchbot. \u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0436\u0430\u0442\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Levante o bra\xE7o do Switchbot. Modo de imprensa apenas.",
            es: "Levante el brazo del Switchbot. Modo de prensa solamente.",
            pl: "Podnie\u015B rami\u0119 Switchbot. Tylko tryb prasy.",
            "zh-cn": "\u4E3E\u8D77Switchbot\u7684\u624B\u81C2. \u4EC5\u6309\u538B\u6A21\u5F0F.",
            uk: "\u041F\u0456\u0434\u043D\u0456\u043C\u0456\u0442\u044C \u0440\u0443\u043A\u0443 Switchbot. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043D\u0430\u0442\u0438\u0441\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            ru: "\u041E\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0440\u0443\u043A\u0443 Switchbot. \u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0436\u0430\u0442\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Baixe o bra\xE7o do Switchbot. Modo de imprensa apenas.",
            es: "Baje el brazo del Switchbot. Modo de prensa solamente.",
            pl: "Obni\u017C rami\u0119 Switchbot. Tylko tryb prasy.",
            "zh-cn": "\u964D\u4F4ESwitchbot\u7684\u624B\u81C2. \u4EC5\u6309\u538B\u6A21\u5F0F.",
            uk: "\u041E\u043F\u0443\u0441\u0442\u0456\u0442\u044C \u0440\u0443\u043A\u0443 Switchbot. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043D\u0430\u0442\u0438\u0441\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            fr: "Abaissez le bras du Switchbot et soulevez-le \xE0 nouveau. Mode presse uniquement.",
            nl: "Laat de arm van de Switchbot zakken en til hem weer op. Alleen drukmodus.",
            ru: "\u041E\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0440\u0443\u043A\u0443 Switchbot \u0438 \u0441\u043D\u043E\u0432\u0430 \u043F\u043E\u0434\u043D\u0438\u043C\u0438\u0442\u0435 \u0435\u0435. \u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0436\u0430\u0442\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Baixe o bra\xE7o do Switchbot e levante-o novamente. Modo de imprensa apenas.",
            es: "Baje el brazo del Switchbot y lev\xE1ntelo de nuevo. Modo de prensa solamente.",
            pl: "Obni\u017C rami\u0119 Switchbot i podnie\u015B je ponownie. Tylko tryb prasy.",
            "zh-cn": "\u964D\u4F4ESwitchbot\u7684\u624B\u81C2\uFF0C\u7136\u540E\u518D\u6B21\u62AC\u8D77. \u4EC5\u6309\u538B\u6A21\u5F0F.",
            uk: "\u041E\u043F\u0443\u0441\u0442\u0456\u0442\u044C \u0440\u0443\u043A\u0443 Switchbot \u0456 \u0437\u043D\u043E\u0432\u0443 \u043F\u0456\u0434\u043D\u0456\u043C\u0456\u0442\u044C \u0457\u0457. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043D\u0430\u0442\u0438\u0441\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            ru: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044C. \u0420\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Ligue o interruptor. Modo de comuta\xE7\xE3o apenas.",
            es: "Encienda el interruptor. Solo modo de interruptor.",
            pl: "W\u0142\u0105cz prze\u0142\u0105cznik. Tylko tryb prze\u0142\u0105czania.",
            "zh-cn": "\u6253\u5F00\u5F00\u5173. \u4EC5\u5207\u6362\u6A21\u5F0F.",
            uk: "\u0423\u0432\u0456\u043C\u043A\u043D\u0456\u0442\u044C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u0447. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            fr: "\xC9teignez l'interrupteur. Mode de commutation uniquement.",
            nl: "Zet de schakelaar uit. Alleen schakelmodus.",
            ru: "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044C. \u0420\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Desligue o interruptor. Modo de comuta\xE7\xE3o apenas.",
            es: "Apague el interruptor. Solo modo de interruptor.",
            pl: "Wy\u0142\u0105cz prze\u0142\u0105cznik. Tylko tryb prze\u0142\u0105czania.",
            "zh-cn": "\u5173\u95ED\u5F00\u5173. \u4EC5\u5207\u6362\u6A21\u5F0F.",
            uk: "\u0412\u0438\u043C\u043A\u043D\u0456\u0442\u044C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u0447. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            fr: "Contr\xF4le inverse ON / OFF. Mode de commutation uniquement.",
            nl: "Inverse AAN / UIT-bediening. Alleen schakelmodus.",
            ru: "\u0418\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0412\u041A\u041B / \u0412\u042B\u041A\u041B. \u0420\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E.",
            pt: "Controle inverso LIGADO / DESLIGADO. Modo de comuta\xE7\xE3o apenas.",
            es: "Control inverso ON / OFF. Solo modo de interruptor.",
            pl: "Odwr\xF3\u0107 sterowanie W\u0141\u0104CZ / WY\u0141\u0104CZ. Tylko tryb prze\u0142\u0105czania.",
            "zh-cn": "\u53CD\u5411ON / OFF\u63A7\u5236. \u4EC5\u5207\u6362\u6A21\u5F0F.",
            uk: "\u0406\u043D\u0432\u0435\u0440\u0442\u0443\u0432\u0430\u0442\u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F \u0412\u041A\u041B / \u0412\u0418\u041A\u041B. \u0422\u0456\u043B\u044C\u043A\u0438 \u0440\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u043D\u043D\u044F."
          }
        },
        native: void 0
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
            ru: "\u0420\u0435\u0436\u0438\u043C Switchbot",
            pt: "Modo do Switchbot",
            es: "Modo del Switchbot",
            pl: "Tryb Switchbot",
            "zh-cn": "Switchbot\u7684\u6A21\u5F0F",
            uk: "\u0420\u0435\u0436\u0438\u043C Switchbot"
          },
          desc: {
            en: "0: Switch mode = On and Off. 1: Press mode = Single press.",
            de: "0: Schaltmodus = Ein und Aus. 1: Druckmodus = Einzelklick.",
            fr: "0: Mode de commutation = Marche et arr\xEAt. 1: Mode de pression = Appui simple.",
            nl: "0: Schakelmodus = Aan en uit. 1: Drukmodus = Enkele druk.",
            ru: "0: \u0420\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F = \u0412\u043A\u043B. \u0438 \u0412\u044B\u043A\u043B. 1: \u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0436\u0430\u0442\u0438\u044F = \u041E\u0434\u0438\u043D\u043E\u0447\u043D\u043E\u0435 \u043D\u0430\u0436\u0430\u0442\u0438\u0435.",
            pt: "0: Modo de comuta\xE7\xE3o = Ligado e desligado. 1: Modo de press\xE3o = Press\xE3o \xFAnica.",
            es: "0: Modo de conmutaci\xF3n = Encendido y apagado. 1: Modo de presi\xF3n = Pulsaci\xF3n \xFAnica.",
            pl: "0: Tryb prze\u0142\u0105czania = W\u0142\u0105cz i wy\u0142\u0105cz. 1: Tryb nacisku = Naci\u015Bni\u0119cie jednego przycisku.",
            "zh-cn": "0\uFF1A\u5207\u6362\u6A21\u5F0F=\u6253\u5F00\u548C\u5173\u95ED\u3002 1\uFF1A\u6309\u4E0B\u6A21\u5F0F=\u5355\u51FB\u3002",
            uk: "0: \u0420\u0435\u0436\u0438\u043C \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u043D\u043D\u044F = \u0423\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043E \u0456 \u0412\u0438\u043C\u043A\u043D\u0435\u043D\u043E. 1: \u0420\u0435\u0436\u0438\u043C \u043D\u0430\u0442\u0438\u0441\u043A\u0430\u043D\u043D\u044F = \u041E\u0434\u0438\u043D\u043E\u0447\u043D\u0435 \u043D\u0430\u0442\u0438\u0441\u043A\u0430\u043D\u043D\u044F."
          },
          type: "number",
          read: true,
          write: true,
          def: 0,
          states: {
            0: "Press",
            1: "Switch"
          }
        },
        native: void 0
      },
      {
        id: "battery",
        common: {
          role: "value",
          name: "Battery",
          desc: {
            en: "Battery level of the device",
            de: "Batteriestand des Ger\xE4ts",
            fr: "Niveau de batterie de l'appareil",
            nl: "Batterijniveau van het apparaat",
            ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0437\u0430\u0440\u044F\u0434\u0430 \u0430\u043A\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u0430 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430",
            pt: "N\xEDvel de bateria do dispositivo",
            es: "Nivel de bater\xEDa del dispositivo",
            pl: "Poziom na\u0142adowania baterii urz\u0105dzenia",
            "zh-cn": "\u8BBE\u5907\u7684\u7535\u6C60\u7535\u91CF",
            uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u0437\u0430\u0440\u044F\u0434\u0443 \u0430\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u0430 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E"
          },
          type: "number",
          unit: "%",
          read: true,
          write: false,
          def: 0
        },
        native: void 0
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
            fr: "Repr\xE9sente l'\xE9tat du commutateur. True = On, False = Off",
            nl: "Vertegenwoordigt de staat van de schakelaar. True = Aan, False = Uit",
            ru: "\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044F. True = \u0412\u043A\u043B, False = \u0412\u044B\u043A\u043B",
            pt: "Representa o estado do interruptor. True = On, False = Off",
            es: "Representa el estado del interruptor. True = On, False = Off",
            pl: "Przedstawia stan prze\u0142\u0105cznika. True = On, False = Off",
            "zh-cn": "\u8868\u793A\u5F00\u5173\u7684\u72B6\u6001\u3002 True = On\uFF0CFalse = Off",
            uk: "\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u044F\u0454 \u0441\u0442\u0430\u043D \u043F\u0435\u0440\u0435\u043C\u0438\u043A\u0430\u0447\u0430. True = \u0412\u043A\u043B, False = \u0412\u0438\u043C\u043A\u043D."
          }
        },
        native: void 0
      }
    ];
    return {
      device: deviceObject,
      channels: channelObjects,
      states: stateObjects
    };
  },
  getValues: (context) => {
    if (context == null)
      return;
    const ret = {
      switchState: context.switchState === 1,
      battery: context.battery,
      "control.mode": context.mode
    };
    return ret;
  },
  stateChange: () => {
    import_global.Global.adapter.log.info(`stateChange:`);
    import_global.Global.adapter.on("stateChange", (id, state) => {
      import_global.Global.adapter.log.info(`stateChange: ${id} ${JSON.stringify(state)}`);
    });
    return;
  }
};
function parseData(data) {
  const result = {};
  result.mode = data[1] & 128;
  result.switchState = data[1] & 127;
  result.dataCommit = data[1] & 16;
  result.groupD = data[1] & 8;
  result.groupC = data[1] & 4;
  result.groupB = data[1] & 2;
  result.groupA = data[1] & 1;
  result.battery = data[2] & 127;
  result.syncUtc = data[2] & 128;
  return result;
}
module.exports = plugin;
//# sourceMappingURL=switchbot.js.map
