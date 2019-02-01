const path = require("path");
const { tests } = require("@iobroker/testing");

// Mock noble package
const nobleMock = {
	on() {},
	state: "poweredOff",
}

// Run tests
tests.offline.adapterStartup(path.join(__dirname, ".."), {
	allowedExitCodes: [11],
	additionalMockedModules: {
		"noble": nobleMock,
		"@abandonware/noble": nobleMock,
	},
});