export class PresenceInfo {
	/** A list of recent timestamps when this device has been detected */
	public recentTimestamps: number[] = [];
	/** The duration in milliseconds this presence info will be kept for */
	public expiryDuration: number = 10000;

	/** Tries to expire this presence info. In the process, recentTimestamps is cleaned from old entries */
	public expire(): boolean {
		const now = Date.now();
		this.recentTimestamps = this.recentTimestamps.filter(ts => (now - ts) > this.expiryDuration);
		return this.recentTimestamps.length === 0;
	}

	/** Computes the average frequency this device is updated with */
	public computeUpdateFrequency() {
		if (this.recentTimestamps.length < 2) return null;
		return (this.recentTimestamps[this.recentTimestamps.length - 1] - this.recentTimestamps[0])
			/ (this.recentTimestamps.length - 1);
	}
}
