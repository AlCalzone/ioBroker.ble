///
/// Stellt einen Promise-Wrapper für asynchrone Node-Funktionen zur Verfügung
///
"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZXMuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibGliL3Byb21pc2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEdBQUc7QUFDSCw2RUFBNkU7QUFDN0UsR0FBRzs7O0FBS0gsbUJBQTBCLEVBQUUsRUFBRSxPQUFPO0lBQ3BDLE1BQU0sQ0FBQztRQUFTLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ3RCLE9BQU8sR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2xDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFNLElBQUksU0FBRSxVQUFDLEtBQUssRUFBRSxNQUFNO29CQUN6QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3RCLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDeEIsQ0FBQztnQkFDRixDQUFDLEdBQUUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQWJELDhCQWFDO0FBR0QsMEJBQWlDLEVBQUUsRUFBRSxPQUFPO0lBQzNDLE1BQU0sQ0FBQztRQUFTLGNBQU87YUFBUCxVQUFPLEVBQVAscUJBQU8sRUFBUCxJQUFPO1lBQVAseUJBQU87O1FBQ3RCLE9BQU8sR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ2xDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFNLElBQUksU0FBRSxVQUFDLE1BQU07b0JBQ2xDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsR0FBRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7QUFDSCxDQUFDO0FBVEQsNENBU0M7QUFFRDtJQUEwQixZQUF3QjtTQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7UUFBeEIsdUJBQXdCOztJQUNqRCxnREFBZ0Q7SUFDaEQscURBQXFEO0lBQ3JELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUNmLFVBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSyxPQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQWQsQ0FBYyxFQUM3QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQ2pCLENBQUM7QUFDSCxDQUFDO0FBUEQsOEJBT0MifQ==