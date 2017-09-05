"use strict";
// TODO: WTF happened with the merged PR?
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:unified-signatures
// tslint:disable:no-var-requires
var fs = require("fs");
// Get js-controller directory to load libs
function getControllerDir(isInstall) {
    // Find the js-controller location
    var controllerDir = __dirname.replace(/\\/g, '/');
    controllerDir = controllerDir.split('/');
    if (controllerDir[controllerDir.length - 4] === 'adapter') {
        controllerDir.splice(controllerDir.length - 4, 4);
        controllerDir = controllerDir.join('/');
    }
    else if (controllerDir[controllerDir.length - 4] === 'node_modules') {
        controllerDir.splice(controllerDir.length - 4, 4);
        controllerDir = controllerDir.join('/');
        if (fs.existsSync(controllerDir + '/node_modules/iobroker.js-controller')) {
            controllerDir += '/node_modules/iobroker.js-controller';
        }
        else if (fs.existsSync(controllerDir + '/node_modules/ioBroker.js-controller')) {
            controllerDir += '/node_modules/ioBroker.js-controller';
        }
        else if (!fs.existsSync(controllerDir + '/controller.js')) {
            if (!isInstall) {
                console.log("Cannot find js-controller");
                process.exit(10);
            }
            else {
                process.exit();
            }
        }
    }
    else {
        if (!isInstall) {
            console.log("Cannot find js-controller");
            process.exit(10);
        }
        else {
            process.exit();
        }
    }
    return controllerDir;
}
// Read controller configuration file
var controllerDir = getControllerDir(typeof process !== "undefined" && process.argv && process.argv.indexOf("--install") !== -1);
function getConfig() {
    return JSON.parse(fs.readFileSync(controllerDir + "/conf/iobroker.json", "utf8"));
}
var adapter = require(controllerDir + "/lib/adapter.js");
exports.default = {
    controllerDir: controllerDir,
    getConfig: getConfig,
    adapter: adapter,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiZDovaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEseUNBQXlDOztBQUV6QyxvQ0FBb0M7QUFDcEMsaUNBQWlDO0FBQ2pDLHVCQUF5QjtBQUV6QiwyQ0FBMkM7QUFDM0MsMEJBQTBCLFNBQVM7SUFDL0Isa0NBQWtDO0lBQ2xDLElBQUksYUFBYSxHQUFzQixTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyRSxhQUFhLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3hELGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLGFBQWEsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUcsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsYUFBYSxJQUFJLHNDQUFzQyxDQUFDO1FBQzVELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUcsc0NBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEYsYUFBYSxJQUFJLHNDQUFzQyxDQUFDO1FBQ3pELENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztnQkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ1AsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixDQUFDO0lBQ0YsQ0FBQztJQUNELE1BQU0sQ0FBQyxhQUF1QixDQUFDO0FBQ2hDLENBQUM7QUFFRCxxQ0FBcUM7QUFDckMsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuSTtJQUNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxHQUFHLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDbkYsQ0FBQztBQUVELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztBQUUzRCxrQkFBZTtJQUNkLGFBQWEsRUFBRSxhQUFhO0lBQzVCLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLE9BQU8sRUFBRSxPQUFPO0NBTWhCLENBQUMifQ==