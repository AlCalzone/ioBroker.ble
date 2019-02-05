// @ts-check

const path = require("path");
const { tests } = require("@iobroker/testing");
const adapterDir = path.join(__dirname, "..");

// Run tests
tests.integration(adapterDir, {
	allowedExitCodes: [11],

	defineAdditionalTests(getHarness) {

		const ENV = { TESTING: "true" };

		describe("Test sendTo", () => {

			it("Should work", function () {
				this.timeout(60000);
				return new Promise((resolve) => {
					const harness = getHarness();
					harness.startAdapterAndWait(ENV).then(() => {
						setTimeout(() => {
							harness.sendTo("ble.0", "test", "message", (resp) => {
								console.dir(resp);
								resolve();
							});
						}, 2500);
					});
				});
			});

		});

	},
});
