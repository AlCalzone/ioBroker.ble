"use strict";
/*!
 * Alias for Xiaomi plugin
 */
// tslint:disable:no-var-requires
var plugin_1 = require("./plugin");
var plugin = plugin_1.alias("mi-flora", require("./xiaomi"));
module.exports = plugin;
