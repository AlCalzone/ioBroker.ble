"use strict";
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
        }
        return ret;
    },
};
module.exports = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2RlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiQzovVXNlcnMvRG9taW5pYy9Eb2N1bWVudHMvVmlzdWFsIFN0dWRpbyAyMDE3L1JlcG9zaXRvcmllcy9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsicGx1Z2lucy9fZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBR0EsbUJBQW1CLEdBQVc7SUFDN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLGNBQWM7UUFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1AsbUJBQW1CO1FBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7QUFDRixDQUFDO0FBRUQsSUFBTSxNQUFNLEdBQVc7SUFDdEIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsV0FBVyxFQUFFLCtEQUErRDtJQUU1RSw4Q0FBOEM7SUFDOUMsa0JBQWtCLEVBQUUsRUFBRTtJQUN0QixVQUFVLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxJQUFJLEVBQUosQ0FBSTtJQUV2QixhQUFhLEVBQUUsVUFBQyxVQUEwQjtRQUV6QyxJQUFNLFlBQVksR0FBMkI7WUFDNUMsTUFBTSxFQUFFLElBQUk7WUFDWixNQUFNLEVBQUUsSUFBSTtTQUNaLENBQUM7UUFFRixJQUFNLFNBQVMsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBTSxhQUFhLEdBQTRCO1lBQzlDLEVBQUUsRUFBRSxTQUFTO1lBQ2IsTUFBTSxFQUFFO2dCQUNQLFNBQVM7Z0JBQ1QsSUFBSSxFQUFFLHFCQUFxQjtnQkFDM0IsSUFBSSxFQUFFLE1BQU07YUFDWjtZQUNELE1BQU0sRUFBRSxJQUFJO1NBQ1osQ0FBQztRQUVGLElBQU0sWUFBWSxHQUE0QixFQUFFLENBQUM7UUFDakQsR0FBRyxDQUFDLENBQWdCLFVBQW9DLEVBQXBDLEtBQUEsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQXBDLGNBQW9DLEVBQXBDLElBQW9DO1lBQW5ELElBQU0sS0FBSyxTQUFBO1lBQ2YsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFNLE9BQU8sR0FBTSxTQUFTLFNBQUksSUFBTSxDQUFDO1lBRXZDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2pCLEVBQUUsRUFBRSxPQUFPO2dCQUNYLE1BQU0sRUFBRTtvQkFDUCxJQUFJLEVBQUUsT0FBTztvQkFDYixJQUFJLEVBQUUscUJBQXFCLEdBQUcsSUFBSTtvQkFDbEMsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLE9BQU87b0JBQ2IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsS0FBSyxFQUFFLEtBQUs7aUJBQ1o7Z0JBQ0QsTUFBTSxFQUFFLElBQUk7YUFDWixDQUFDLENBQUM7U0FDSDtRQUVELE1BQU0sQ0FBQztZQUNOLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztZQUN6QixNQUFNLEVBQUUsWUFBWTtTQUNwQixDQUFDO0lBRUgsQ0FBQztJQUVELFNBQVMsRUFBRSxVQUFDLFVBQTBCO1FBQ3JDLElBQU0sR0FBRyxHQUEwQixFQUFFLENBQUM7UUFDdEMsR0FBRyxDQUFDLENBQWdCLFVBQW9DLEVBQXBDLEtBQUEsVUFBVSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQXBDLGNBQW9DLEVBQXBDLElBQW9DO1lBQW5ELElBQU0sS0FBSyxTQUFBO1lBQ2YsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFNLE9BQU8sR0FBRyxjQUFZLElBQU0sQ0FBQztZQUNuQyxnQ0FBZ0M7WUFDaEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckM7UUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNELENBQUM7QUFFRixpQkFBUyxNQUFNLENBQUMifQ==