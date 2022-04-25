var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scanProcessInterface_exports = {};
__export(scanProcessInterface_exports, {
  ScanExitCodes: () => ScanExitCodes,
  getMessageReviver: () => getMessageReviver
});
module.exports = __toCommonJS(scanProcessInterface_exports);
var import_typeguards = require("alcalzone-shared/typeguards");
var ScanExitCodes = /* @__PURE__ */ ((ScanExitCodes2) => {
  ScanExitCodes2[ScanExitCodes2["RequireNobleFailed"] = 1] = "RequireNobleFailed";
  return ScanExitCodes2;
})(ScanExitCodes || {});
function getMessageReviver(callback) {
  const reviveValue = (value) => {
    if ((0, import_typeguards.isArray)(value)) {
      return value.map((v) => reviveValue(v));
    } else if ((0, import_typeguards.isObject)(value)) {
      const v = value;
      if (v.type === "Buffer" && (0, import_typeguards.isArray)(v.data)) {
        return Buffer.from(v.data);
      } else if (v.type === "Error" && typeof v.name === "string" && typeof v.message === "string") {
        const ret = new Error(v.message);
        ret.name = v.name;
        ret.stack = v.stack;
        return ret;
      }
      return reviveObject(value);
    } else {
      return value;
    }
  };
  const reviveObject = (input) => {
    const ret = {};
    for (const [key, value] of Object.entries(input)) {
      ret[key] = reviveValue(value);
    }
    return ret;
  };
  return (input) => {
    callback(reviveObject(input));
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ScanExitCodes,
  getMessageReviver
});
//# sourceMappingURL=scanProcessInterface.js.map
