"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:trailing-comma
function str2regex(pattern) {
    return new RegExp(pattern
        .replace(/\./g, "\\.") // Punkte als solche matchen
        .replace(/\*/g, ".*") // Wildcard in Regex umsetzen
        .replace(/\!/g, "?!") // negative lookahead
    );
}
exports.str2regex = str2regex;
