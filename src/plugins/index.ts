import { Plugin } from "./plugin";

// tslint:disable:no-var-requires
export default [
	require("./xiaomi"),
	require("./mi-flora"),
	require("./_default"),
] as Plugin[];
