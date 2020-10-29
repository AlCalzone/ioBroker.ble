"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Global = void 0;
const objects_1 = require("alcalzone-shared/objects");
const fs = require("fs");
const path = require("path");
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
    /**
     * Kurzschreibweise für die Ermittlung mehrerer Objekte
     * @param id
     */
    static async $$(pattern, type, role) {
        const objects = await Global._adapter.getForeignObjectsAsync(pattern, type);
        if (role) {
            return objects_1.filter(objects, (o) => o.common.role === role);
        }
        else {
            return objects;
        }
    }
    // Workaround für unvollständige Adapter-Upgrades
    static async ensureInstanceObjects() {
        // read io-package.json
        const ioPack = JSON.parse(fs.readFileSync(path.join(__dirname, "../../io-package.json"), "utf8"));
        if (ioPack.instanceObjects == null ||
            ioPack.instanceObjects.length === 0)
            return;
        // wait for all instance objects to be created
        const setObjects = ioPack.instanceObjects.map((obj) => Global._adapter.setObjectNotExistsAsync(obj._id, obj));
        await Promise.all(setObjects);
    }
}
exports.Global = Global;
//# sourceMappingURL=global.js.map