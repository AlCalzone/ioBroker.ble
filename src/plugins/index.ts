import type { Plugin } from "./plugin";

export default [
	require("./xiaomi"),
	require("./mi-flora"),
	require("./ruuvi-tag"),
	require("./switchbot"),
	require("./_default"), // must be last
] as Plugin[];
