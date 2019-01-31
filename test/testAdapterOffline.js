const path = require("path");
const { tests } = require("@iobroker/testing");

// Run tests
tests.offline.adapterStartup(path.join(__dirname, ".."), {
	allowedExitCodes: [11]
});