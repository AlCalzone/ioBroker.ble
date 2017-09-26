"use strict";
// tslint:disable:no-var-requires
/*
    Allows easier local debugging over SSH.
    Running `npm run deploy_local` updates remote adapter files
    and restarts the instance
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    CONFIGURATION:
        - provide a deploy_password.json file in the project root with contents
            {
                "host": "<HOSTNAME>",
                "username": "<USERNAME>",
                "password": "<PASSWORD>"
            }
        - specify which dirs and files should be uploaded
        - specify where the root dir is relative to this script
*/
var uploadDirs = ["admin", "build"];
var uploadFiles = ["package.json", "io-package.json", "main.js"];
var rootDir = "../";
var nodeSSH = require("node-ssh");
var path = require("path");
var localRoot = path.resolve(__dirname, rootDir);
var ioPack = require(path.join(rootDir, "io-package.json"));
var ADAPTER_NAME = ioPack.common.name;
var ssh = new nodeSSH();
var sshConfig = require(path.join(rootDir, "deploy_password.json"));
var remoteRoot = "/opt/iobroker/node_modules/iobroker." + ADAPTER_NAME;
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, uploadDirs_1, dir, _a, uploadFiles_1, file, execResult;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ssh.connect(sshConfig)];
                case 1:
                    _b.sent();
                    _i = 0, uploadDirs_1 = uploadDirs;
                    _b.label = 2;
                case 2:
                    if (!(_i < uploadDirs_1.length)) return [3 /*break*/, 5];
                    dir = uploadDirs_1[_i];
                    console.log("uploading " + dir + " dir from \"" + localRoot + "\" to \"" + remoteRoot + "\"...");
                    return [4 /*yield*/, ssh.putDirectory(path.join(localRoot, dir), path.join(remoteRoot, dir), {
                            recursive: true,
                            concurrency: 10,
                            validate: function (pathname) {
                                var basename = path.basename(pathname);
                                return !basename.startsWith("deploy_");
                            },
                        })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _a = 0, uploadFiles_1 = uploadFiles;
                    _b.label = 6;
                case 6:
                    if (!(_a < uploadFiles_1.length)) return [3 /*break*/, 9];
                    file = uploadFiles_1[_a];
                    console.log("uploading " + file + " from \"" + localRoot + "\" to \"" + remoteRoot + "\"...");
                    return [4 /*yield*/, ssh.putFile(path.join(localRoot, file), path.join(remoteRoot, file))];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log("updating in-mem adapter");
                    return [4 /*yield*/, ssh.execCommand("iobroker upload " + ADAPTER_NAME)];
                case 10:
                    execResult = _b.sent();
                    console.log(execResult.stdout);
                    console.log(execResult.stderr);
                    return [4 /*yield*/, ssh.execCommand("iobroker restart " + ADAPTER_NAME)];
                case 11:
                    execResult = _b.sent();
                    console.log(execResult.stdout);
                    console.log(execResult.stderr);
                    console.log("done");
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95X2xvY2FsLmpzIiwic291cmNlUm9vdCI6IkM6L1VzZXJzL0RvbWluaWMvRG9jdW1lbnRzL1Zpc3VhbCBTdHVkaW8gMjAxNy9SZXBvc2l0b3JpZXMvaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbImRlcGxveV9sb2NhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUNBQWlDO0FBQ2pDOzs7O0VBSUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRjs7Ozs7Ozs7OztFQVVFO0FBQ0YsSUFBTSxVQUFVLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdEMsSUFBTSxXQUFXLEdBQUcsQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDbkUsSUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBT3RCLGtDQUFvQztBQUNwQywyQkFBNkI7QUFFN0IsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFbkQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUM5RCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUV4QyxJQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBQzFCLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFFdEUsSUFBTSxVQUFVLEdBQUcseUNBQXVDLFlBQWMsQ0FBQztBQUV6RSxDQUFDOzs4QkFHVyxHQUFHLHFCQVdILElBQUksRUFNWCxVQUFVOzs7d0JBbkJkLHFCQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUE7O29CQUE1QixTQUE0QixDQUFDOzs7O3lCQUVYLENBQUEsd0JBQVUsQ0FBQTs7b0JBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBYSxHQUFHLG9CQUFjLFNBQVMsZ0JBQVMsVUFBVSxVQUFNLENBQUMsQ0FBQztvQkFDOUUscUJBQU0sR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRTs0QkFDN0UsU0FBUyxFQUFFLElBQUk7NEJBQ2YsV0FBVyxFQUFFLEVBQUU7NEJBQ2YsUUFBUSxFQUFFLFVBQUMsUUFBUTtnQ0FDbEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDekMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDeEMsQ0FBQzt5QkFDRCxDQUFDLEVBQUE7O29CQVBGLFNBT0UsQ0FBQzs7O29CQVRjLElBQVUsQ0FBQTs7Ozs7O3lCQVdULENBQUEseUJBQVcsQ0FBQTs7b0JBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBYSxJQUFJLGdCQUFVLFNBQVMsZ0JBQVMsVUFBVSxVQUFNLENBQUMsQ0FBQztvQkFDM0UscUJBQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFBOztvQkFBMUUsU0FBMEUsQ0FBQzs7O29CQUZ6RCxJQUFXLENBQUE7OztvQkFPOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUMxQixxQkFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLHFCQUFtQixZQUFjLENBQUMsRUFBQTs7b0JBQXJFLFVBQVUsR0FBRyxTQUF3RCxDQUFDO29CQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xCLHFCQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsc0JBQW9CLFlBQWMsQ0FBQyxFQUFBOztvQkFBdEUsVUFBVSxHQUFHLFNBQXlELENBQUM7b0JBQ3ZFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Q0FDaEIsQ0FBQyxFQUFFLENBQUMifQ==