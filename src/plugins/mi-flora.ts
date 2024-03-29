/*!
 * Alias for Xiaomi plugin
 */

/* eslint-disable @typescript-eslint/no-var-requires */

import { alias, type Plugin } from "./plugin";
const plugin: Plugin = alias("mi-flora", require("./xiaomi") as Plugin);
export = plugin;
