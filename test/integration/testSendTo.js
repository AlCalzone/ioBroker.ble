/**
 * @param {() => import("@iobroker/testing").IntegrationTestHarness} getHarness
 */
module.exports = function (getHarness) {
	describe("Test sendTo", () => {

		it("Should work", () => {
			return new Promise((resolve) => {
				const harness = getHarness();
				harness.startAdapterAndWait().then(() => {
					harness.sendTo("ble.0", "test", "message", (resp) => {
						console.dir(resp);
						resolve();
					});
				});
			});
		});

	});
}