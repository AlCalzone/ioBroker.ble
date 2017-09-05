"use strict";
/**
 *
 * template adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "template",                  // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.0.0",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "Node.js template Adapter",  // Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "name <mail@template.com>"
 *          ]
 *          "desc":         "template adapter",          // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "daemon",                   // possible values "daemon", "schedule", "subscribe"
 *          "schedule":     "0 0 * * *"                 // cron-style schedule. Only needed if mode=schedule
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *          "test1": true,
 *          "test2": 42
 *      }
 *  }
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
// you have to require the utils module and call adapter function
var utils_1 = require("./lib/utils");
// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
var adapter = utils_1.default.adapter({
    name: "template-ts",
    // is called when databases are connected and adapter received configuration.
    // start here!
    ready: main,
    // is called when adapter shuts down - callback has to be called under any circumstances!
    unload: function (callback) {
        try {
            adapter.log.info("cleaned everything up...");
            callback();
        }
        catch (e) {
            callback();
        }
    },
    // is called if a subscribed object changes
    objectChange: function (id, obj) {
        // Warning, obj can be null if it was deleted
        adapter.log.info("objectChange " + id + " " + JSON.stringify(obj));
    },
    // is called if a subscribed state changes
    stateChange: function (id, state) {
        // Warning, state can be null if it was deleted
        adapter.log.info("stateChange " + id + " " + JSON.stringify(state));
        // you can use the ack flag to detect if it is status (true) or command (false)
        if (state && !state.ack) {
            adapter.log.info("ack is not set!");
        }
    },
    // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
    // requires the property to be configured in io-package.json
    message: function (obj) {
        if (typeof obj === "object" && obj.message) {
            if (obj.command === "send") {
                // e.g. send email or pushover or whatever
                console.log("send command");
                // Send response in callback if required
                if (obj.callback)
                    adapter.sendTo(obj.from, obj.command, "Message received", obj.callback);
            }
        }
    },
});
function main() {
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.info("config test1: " + adapter.config.test1);
    adapter.log.info("config test1: " + adapter.config.test2);
    /**
     *
     *      For every state in the system there has to be also an object of type state
     *
     *      Here a simple template for a boolean variable named "testVariable"
     *
     *      Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
     *
     */
    adapter.setObject("testVariable", {
        type: "state",
        common: {
            name: "testVariable",
            type: "boolean",
            role: "indicator",
            read: true,
            write: true,
        },
        native: {},
    });
    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates("*");
    /**
     *   setState examples
     *
     *   you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
     *
     */
    // the variable testVariable is set to true as command (ack=false)
    adapter.setState("testVariable", true);
    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    adapter.setState("testVariable", { val: true, ack: true });
    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    adapter.setState("testVariable", { val: true, ack: true, expire: 30 });
    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword("admin", "iobroker", function (res) {
        console.log("check user admin pw ioboker: " + res);
    });
    adapter.checkGroup("admin", "admin", function (res) {
        console.log("check group user admin group admin: " + res);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJkOi9pb0Jyb2tlci5ibGUvc3JjLyIsInNvdXJjZXMiOlsibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRzs7QUFFSCxpRUFBaUU7QUFDakUscUNBQWdDO0FBRWhDLGtFQUFrRTtBQUNsRSx3R0FBd0c7QUFDeEcsaUhBQWlIO0FBQ2pILElBQU0sT0FBTyxHQUFHLGVBQUssQ0FBQyxPQUFPLENBQUM7SUFDMUIsSUFBSSxFQUFFLGFBQWE7SUFFbkIsNkVBQTZFO0lBQzdFLGNBQWM7SUFDZCxLQUFLLEVBQUUsSUFBSTtJQUVYLHlGQUF5RjtJQUN6RixNQUFNLEVBQUUsVUFBQyxRQUFRO1FBQ2IsSUFBSSxDQUFDO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUM3QyxRQUFRLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsUUFBUSxFQUFFLENBQUM7UUFDZixDQUFDO0lBQ0wsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxZQUFZLEVBQUUsVUFBQyxFQUFFLEVBQUUsR0FBRztRQUNsQiw2Q0FBNkM7UUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsV0FBVyxFQUFFLFVBQUMsRUFBRSxFQUFFLEtBQUs7UUFDbkIsK0NBQStDO1FBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVwRSwrRUFBK0U7UUFDL0Us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