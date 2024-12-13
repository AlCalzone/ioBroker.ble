var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var global_exports = {};
__export(global_exports, {
  Global: () => Global
});
module.exports = __toCommonJS(global_exports);
var import_objects = require("alcalzone-shared/objects");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
class Global {
  static get adapter() {
    return Global._adapter;
  }
  static set adapter(adapter) {
    Global._adapter = adapter;
  }
  static get objectCache() {
    return Global._objectCache;
  }
  static set objectCache(cache) {
    Global._objectCache = cache;
  }
  static async $$(pattern, type, role) {
    const objects = await Global._adapter.getForeignObjectsAsync(
      pattern,
      type
    );
    if (role) {
      return (0, import_objects.filter)(objects, (o) => o.common.role === role);
    } else {
      return objects;
    }
  }
  static async ensureInstanceObjects() {
    const ioPack = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../io-package.json"),
        "utf8"
      )
    );
    if (ioPack.instanceObjects == null || ioPack.instanceObjects.length === 0)
      return;
    const setObjects = ioPack.instanceObjects.map(
      (obj) => Global._adapter.setObjectNotExistsAsync(obj._id, obj)
    );
    await Promise.all(setObjects);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Global
});
//# sourceMappingURL=global.js.map
