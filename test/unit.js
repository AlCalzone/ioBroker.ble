// @ts-check

process.on("unhandledRejection", (r) => console.dir(r));

const path = require("path");
const { tests, utils } = require("@iobroker/testing");
const adapterDir = path.join(__dirname, "..");

// Mock noble package
const nobleMock = {
	on() {},
	state: "poweredOff",
}

// Run tests
tests.unit(adapterDir, {
	allowedExitCodes: [11],
	additionalMockedModules: {
		"noble": nobleMock,
		"@abandonware/noble": nobleMock,
	},

	defineAdditionalTests() {
		it("works", () => {});
	}
});

