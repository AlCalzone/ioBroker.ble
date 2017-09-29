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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2RlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsicGx1Z2lucy9fZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0NBQTRDO0FBRzVDLG1CQUFtQixHQUFXO0lBQzdCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixjQUFjO1FBQ2QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNmLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNQLG1CQUFtQjtRQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0FBQ0YsQ0FBQztBQUVELElBQU0sTUFBTSxHQUFXO0lBQ3RCLElBQUksRUFBRSxVQUFVO0lBQ2hCLFdBQVcsRUFBRSwrREFBK0Q7SUFFNUUsOENBQThDO0lBQzlDLGtCQUFrQixFQUFFLEVBQUU7SUFDdEIsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsSUFBSSxFQUFKLENBQUk7SUFFdkIsYUFBYSxFQUFFLFVBQUMsVUFBMEI7UUFFekMsSUFBTSxZQUFZLEdBQTJCO1lBQzVDLE1BQU0sRUFBRSxJQUFJO1lBQ1osTUFBTSxFQUFFLElBQUk7U0FDWixDQUFDO1FBRUYsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQU0sYUFBYSxHQUE0QjtZQUM5QyxFQUFFLEVBQUUsU0FBUztZQUNiLE1BQU0sRUFBRTtnQkFDUCxTQUFTO2dCQUNULElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLElBQUksRUFBRSxNQUFNO2FBQ1o7WUFDRCxNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7UUFFRixJQUFNLFlBQVksR0FBNEIsRUFBRSxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxDQUFnQixVQUFvQyxFQUFwQyxLQUFBLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFwQyxjQUFvQyxFQUFwQyxJQUFvQztZQUFuRCxJQUFNLEtBQUssU0FBQTtZQUNmLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDeEIsSUFBTSxPQUFPLEdBQU0sU0FBUyxTQUFJLElBQU0sQ0FBQztZQUV2QyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUNqQixFQUFFLEVBQUUsT0FBTztnQkFDWCxNQUFNLEVBQUU7b0JBQ1AsSUFBSSxFQUFFLE9BQU87b0JBQ2IsSUFBSSxFQUFFLHFCQUFxQixHQUFHLElBQUk7b0JBQ2xDLElBQUksRUFBRSxFQUFFO29CQUNSLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxJQUFJO29CQUNWLEtBQUssRUFBRSxLQUFLO2lCQUNaO2dCQUNELE1BQU0sRUFBRSxJQUFJO2FBQ1osQ0FBQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLENBQUM7WUFDTixNQUFNLEVBQUUsWUFBWTtZQUNwQixRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDekIsTUFBTSxFQUFFLFlBQVk7U0FDcEIsQ0FBQztJQUVILENBQUM7SUFFRCxTQUFTLEVBQUUsVUFBQyxVQUEwQjtRQUNyQyxJQUFNLEdBQUcsR0FBMEIsRUFBRSxDQUFDO1FBQ3RDLEdBQUcsQ0FBQyxDQUFnQixVQUFvQyxFQUFwQyxLQUFBLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFwQyxjQUFvQyxFQUFwQyxJQUFvQztZQUFuRCxJQUFNLEtBQUssU0FBQTtZQUNmLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDeEIsSUFBTSxPQUFPLEdBQUcsY0FBWSxJQUFNLENBQUM7WUFDbkMsZ0NBQWdDO1lBQ2hDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLGVBQUMsQ0FBQyxHQUFHLENBQUMsZUFBYSxVQUFVLENBQUMsT0FBTyxvQkFBZSxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQVEsSUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3pGO1FBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRCxDQUFDO0FBRUYsaUJBQVMsTUFBTSxDQUFDIn0=