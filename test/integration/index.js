// @ts-check

const path = require("path");
const { tests } = require("@iobroker/testing");
const adapterDir = path.join(__dirname, "../..");

// Run tests
tests.integration(adapterDir, {
	allowedExitCodes: [11],

	defineAdditionalTests: (getHarness) => {
		require("./testSendTo")(getHarness);
	},
});
