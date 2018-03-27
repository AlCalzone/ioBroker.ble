import { Plugin } from "./plugin";

// tslint:disable:no-var-requires
export default [
	require("./xiaomi"),
	require("./mi-flora"),
	require("./ruuvi-tag"),
	require("./_default"),
] as Plugin[];
