import type { Plugin } from "./plugin";

export default [
	require("./xiaomi"),
	require("./mi-flora"),
	require("./ruuvi-tag"),
	require("./_default"),
] as Plugin[];
