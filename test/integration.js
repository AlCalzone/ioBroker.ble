// @ts-check

const path = require("path");
const { tests } = require("@iobroker/testing");
const adapterDir = path.join(__dirname, "..");

// Run tests
tests.integration(adapterDir, {
	allowedExitCodes: [11],

	defineAdditionalTests({ describe, it, suite }) {
		const ENV = { TESTING: "true" };

		suite("Test sendTo", (getHarness) => {
			it("Should work", function () {
				this.timeout(60000);
				return /** @type {Promise<void>} */ (
					new Promise((resolve) => {
						const harness = getHarness();
						harness.startAdapterAndWait(true, ENV).then(() => {
							setTimeout(() => {
								harness.sendTo(
									"ble.0",
									"test",
									"message",
									(resp) => {
										console.dir(resp);
										resolve();
									},
								);
							}, 2500);
						});
					})
				);
			});
		});
	},
});
