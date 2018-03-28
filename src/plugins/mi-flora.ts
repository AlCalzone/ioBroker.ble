/*!
 * Alias for Xiaomi plugin
 */
// tslint:disable:no-var-requires

import { alias, Plugin } from "./plugin";
const plugin: Plugin = alias("mi-flora", require("./xiaomi") as Plugin);
export = plugin;
