"use strict";
///
/// Stellt einen Promise-Wrapper für asynchrone Node-Funktionen zur Verfügung
///
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(fn, context) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        context = context || this;
        return new Promise(function (resolve, reject) {
            fn.apply(context, args.concat([function (error, result) {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(result);
                    }
                }]));
        });
    };
}
exports.promisify = promisify;
function promisifyNoError(fn, context) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        context = context || this;
        return new Promise(function (resolve, reject) {
            fn.apply(context, args.concat([function (result) {
                    return resolve(result);
                }]));
        });
    };
}
exports.promisifyNoError = promisifyNoError;
function waterfall() {
    var fn = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fn[_i] = arguments[_i];
    }
    // Führt eine Reihe von Promises sequentiell aus
    // TODO: Rückgabewerte prüfen (ob da was zu viel ist)
    return fn.reduce(function (prev, cur) { return prev.then(cur); }, Promise.resolve());
}
exports.waterfall = waterfall;
