// 71208300769e2386be7c0809051002001c
// 080c7c0751342d580104d100d801

const packet = Buffer.from("585876050b7c0751342d58df3e2af2e100020047f829f2", "hex");
const X = require("../build/plugins/lib/xiaomi_protocol").XiaomiAdvertisement;

const test = new X(packet);

// frame control: 0c08
// -- version = 0
// -- flags   = c08 ==> 1100 0000 1000 ???

// MAC: 7c0751342d58

// 0104d100d801