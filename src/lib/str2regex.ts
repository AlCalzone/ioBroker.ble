// tslint:disable:trailing-comma
export function str2regex(pattern: string) {
	return new RegExp(
		pattern
			.replace(".", "\.") // Punkte als solche matchen
			.replace("*", ".*") // Wildcard in Regex umsetzen
			.replace("!", "?!") // negative lookahead
	);
}
