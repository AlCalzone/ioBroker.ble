const path = require("path");
const { tests } = require("@iobroker/testing");
const adapterDir = path.join(__dirname, "../..");

// Mock noble package
const nobleMock = {
	on() {},
	state: "poweredOff",
}

// Run tests
tests.unit.adapterStartup(adapterDir, {
	allowedExitCodes: [11],
	additionalMockedModules: {
		"noble": nobleMock,
		"@abandonware/noble": nobleMock,
	},
});