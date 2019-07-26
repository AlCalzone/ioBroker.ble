"use strict";
/*!
 * Alias for Xiaomi plugin
 */
// tslint:disable:no-var-requires
const plugin_1 = require("./plugin");
const plugin = plugin_1.alias("mi-flora", require("./xiaomi"));
module.exports = plugin;
