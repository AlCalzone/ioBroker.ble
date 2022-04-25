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
var object_polyfill_exports = {};
__export(object_polyfill_exports, {
  stripUndefinedProperties: () => stripUndefinedProperties
});
module.exports = __toCommonJS(object_polyfill_exports);
var import_objects = require("alcalzone-shared/objects");
function stripUndefinedProperties(obj) {
  return (0, import_objects.composeObject)((0, import_objects.entries)(obj).filter(([_key, value]) => value != null));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  stripUndefinedProperties
});
//# sourceMappingURL=object-polyfill.js.map
