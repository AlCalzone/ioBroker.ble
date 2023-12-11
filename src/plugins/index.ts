import type { Plugin } from "./plugin";

export default [
	require("./xiaomi"),
	require("./mi-flora"),
	require("./ruuvi-tag"),
	require("./bthome"),
	require("./_default"),
] as Plugin[];
