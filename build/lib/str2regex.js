"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:trailing-comma
function str2regex(pattern) {
    return new RegExp(pattern
        .replace(".", "\.") // Punkte als solche matchen
        .replace("*", ".*") // Wildcard in Regex umsetzen
        .replace("!", "?!") // negative lookahead
    );
}
exports.str2regex = str2regex;
