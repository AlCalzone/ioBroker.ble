"use strict";
var global_1 = require("../lib/global");
function parseData(raw) {
    if (raw.length === 1) {
        // single byte
        return raw[0];
    }
    else {
        // Output hex value
        return raw.toString("hex");
    }
}
var plugin = {
    name: "_default",
    description: "Handles all peripherals that are not handled by other plugins",
    // Just handle all services we receive already
    advertisedServices: [],
    isHandling: function (p) { return true; },
    defineObjects: function (peripheral) {
        var deviceObject = {
            common: null,
            native: null,
        };
        var channelId = "services";
        var channelObject = {
            id: channelId,
            common: {
                // common
                name: "Advertised services",
                role: "info",
            },
            native: null,
        };
        var stateObjects = [];
        for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            var uuid = entry.uuid;
            var stateId = channelId + "." + uuid;
            stateObjects.push({
                id: stateId,
                common: {
                    role: "value",
                    name: "Advertised service " + uuid,
                    desc: "",
                    type: "mixed",
                    read: true,
                    write: false,
                },
                native: null,
            });
        }
        return {
            device: deviceObject,
            channels: [channelObject],
            states: stateObjects,
        };
    },
    getValues: function (peripheral) {
        var ret = {};
        for (var _i = 0, _a = peripheral.advertisement.serviceData; _i < _a.length; _i++) {
            var entry = _a[_i];
            var uuid = entry.uuid;
            var stateId = "services." + uuid;
            // remember the transmitted data
            ret[stateId] = parseData(entry.data);
            global_1.Global.log("_default: " + peripheral.address + " > got data " + ret[stateId] + " for " + uuid, "debug");
        }
        return ret;
    },
};
module.exports = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2RlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiZDovaW9Ccm9rZXIuYmxlL3NyYy8iLCJzb3VyY2VzIjpbInBsdWdpbnMvX2RlZmF1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHdDQUE0QztBQUc1QyxtQkFBbUIsR0FBVztJQUM3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsY0FBYztRQUNkLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDUCxtQkFBbUI7UUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztBQUNGLENBQUM7QUFFRCxJQUFNLE1BQU0sR0FBVztJQUN0QixJQUFJLEVBQUUsVUFBVTtJQUNoQixXQUFXLEVBQUUsK0RBQStEO0lBRTVFLDhDQUE4QztJQUM5QyxrQkFBa0IsRUFBRSxFQUFFO0lBQ3RCLFVBQVUsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLElBQUksRUFBSixDQUFJO0lBRXZCLGFBQWEsRUFBRSxVQUFDLFVBQTBCO1FBRXpDLElBQU0sWUFBWSxHQUEyQjtZQUM1QyxNQUFNLEVBQUUsSUFBSTtZQUNaLE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQztRQUVGLElBQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFNLGFBQWEsR0FBNEI7WUFDOUMsRUFBRSxFQUFFLFNBQVM7WUFDYixNQUFNLEVBQUU7Z0JBQ1AsU0FBUztnQkFDVCxJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixJQUFJLEVBQUUsTUFBTTthQUNaO1lBQ0QsTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO1FBRUYsSUFBTSxZQUFZLEdBQTRCLEVBQUUsQ0FBQztRQUNqRCxHQUFHLENBQUMsQ0FBZ0IsVUFBb0MsRUFBcEMsS0FBQSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBcEMsY0FBb0MsRUFBcEMsSUFBb0M7WUFBbkQsSUFBTSxLQUFLLFNBQUE7WUFDZixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3hCLElBQU0sT0FBTyxHQUFNLFNBQVMsU0FBSSxJQUFNLENBQUM7WUFFdkMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDakIsRUFBRSxFQUFFLE9BQU87Z0JBQ1gsTUFBTSxFQUFFO29CQUNQLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxxQkFBcUIsR0FBRyxJQUFJO29CQUNsQyxJQUFJLEVBQUUsRUFBRTtvQkFDUixJQUFJLEVBQUUsT0FBTztvQkFDYixJQUFJLEVBQUUsSUFBSTtvQkFDVixLQUFLLEVBQUUsS0FBSztpQkFDWjtnQkFDRCxNQUFNLEVBQUUsSUFBSTthQUNaLENBQUMsQ0FBQztTQUNIO1FBRUQsTUFBTSxDQUFDO1lBQ04sTUFBTSxFQUFFLFlBQVk7WUFDcEIsUUFBUSxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxZQUFZO1NBQ3BCLENBQUM7SUFFSCxDQUFDO0lBRUQsU0FBUyxFQUFFLFVBQUMsVUFBMEI7UUFDckMsSUFBTSxHQUFHLEdBQTBCLEVBQUUsQ0FBQztRQUN0QyxHQUFHLENBQUMsQ0FBZ0IsVUFBb0MsRUFBcEMsS0FBQSxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBcEMsY0FBb0MsRUFBcEMsSUFBb0M7WUFBbkQsSUFBTSxLQUFLLFNBQUE7WUFDZixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3hCLElBQU0sT0FBTyxHQUFHLGNBQVksSUFBTSxDQUFDO1lBQ25DLGdDQUFnQztZQUNoQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxlQUFDLENBQUMsR0FBRyxDQUFDLGVBQWEsVUFBVSxDQUFDLE9BQU8sb0JBQWUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFRLElBQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6RjtRQUVELE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0QsQ0FBQztBQUVGLGlCQUFTLE1BQU0sQ0FBQyJ9