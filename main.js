/**
 *
 * template adapter
 *
 *
 *  file io-package.json comments:
 *
 *  {
 *      "common": {
 *          "name":         "enocean",                  // name has to be set and has to be equal to adapters folder name and main file name excluding extension
 *          "version":      "0.1.0",                    // use "Semantic Versioning"! see http://semver.org/
 *          "title":        "Node.js EnOcean Adapter",  // Adapter title shown in User Interfaces
 *          "authors":  [                               // Array of authord
 *              "Jey Cee <jey-cee@live.com>"
 *          ]
 *          "desc":         "EnOcean adapter",          // Adapter description shown in User Interfaces. Can be a language object {de:"...",ru:"..."} or a string
 *          "platform":     "Javascript/Node.js",       // possible values "javascript", "javascript/Node.js" - more coming
 *          "mode":         "daemon",                   // possible values "daemon", "schedule", "subscribe"
 *          "loglevel":     "info"                      // Adapters Log Level
 *      },
 *      "native": {                                     // the native object is available via adapter.config in your adapters code - use it for configuration
 *          "test1": true,
 *          "test2": 42
 *      }
 *  }
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
var adapter = utils.adapter({
    name: 'enocean',

    message: function (obj) {
        // handle the message
        if (obj) {
            switch (obj.command) {

                case 'listUart':
                    if (obj.callback) {
                        var ports = listSerial();
                        adapter.log.info('List of ports: ' + JSON.stringify(ports));
                        respond(ports);
                    }
                    break;
            }
        }
    }
});

var eo      = require("node-enocean")();

var path;
var fs;

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');
    }

});

// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj == 'object' && obj.message) {
        if (obj.command == 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();


});

function main() {
    eo.listen(adapter.config.serialport);

}

eo.on("ready", function(data){
    //Start Teach mode if activated in setting
    if(adapter.config.teachMode === true){
        eo.startLearning();
        //eo.timeout=adapter.config.timeout;
        adapter.log.debug('Teach mode activated for ' + adapter.config.timeout + ' seconds');
        teachModeCounter();
    }
});

function teachModeCounter(){
    var x = adapter.config.timeout;
    setTimeout(function(){
        adapter.extendForeignObject('system.adapter.' + adapter.namespace, {native: {teachMode: false}});
        adapter.log.info('Teach mode deactivated');
    }, x*1000)
}

eo.on("learned",function(data){
    adapter.log.info('New device registered: ' + JSON.stringify(data));
    if(adapter.config.teachMode === true){
        eo.startLearning();
    }
});

eo.on("known-data",function(data) {
    adapter.log.debug('Recived data that are known: ' + JSON.stringify(data));
    var senderID = data['senderId'];
    var rssi = data['rssi'];
    var sensor = data['sensor'];
    var nrOfValues = data['values'].length;
    var nrOfData = data['sensor'].length;


    adapter.setObjectNotExists(senderID, {
        type: 'device',
        common: {
            name: senderID
        },
        native: sensor
    });

    adapter.setObjectNotExists(senderID + '.rssi', {
        type: 'state',
        common: {
            name: senderID + ' rssi',
            role: 'value.rssi',
            type: 'number'
        },
        native: {}
    });

    adapter.setState(senderID + '.rssi', {val: rssi, ack: true});

    //write values transmitted by device
    for (nrOfValues = nrOfValues - 1; nrOfValues >= 0; nrOfValues--) {
        var name = data['values'][nrOfValues]['type'];
        var patt = new RegExp(/\s/g);
        name = name.replace(patt, '_');
        var varValue = data['values'][nrOfValues]['value'];

        //adapter.log.debug('Value: ' + data['values'][nrOfValues]['value']);

        adapter.setObjectNotExists(senderID + '.' + name, {
            type: 'state',
            common: {
                name: name,
                role: 'value',
                type: 'mixed',
                unit: data['values'][nrOfValues]['unit']
            },
            native: {}
        });
        adapter.setState(senderID + '.' + name, {val: varValue, ack: true});
    }

    //write data transmitted by device
    Object.keys(data['data']).forEach(function (k) {
        //adapter.log.info(k + ' - ' + data['data'][k]);
        var key = k;
        var name = data['data'][k]['name'];
        var patt = new RegExp(/\s/g);
        name = name.replace(patt, '_');
        var unit = "";
        var desc = "";
        try {
            unit = data['data'][k]['unit']
        } catch (err) {
        }
        try {
            desc = data['data'][k]['desc']
        } catch (err) {
        }
        var varValue = data['data'][k]['value'];

        adapter.setObjectNotExists(senderID + '.' + key, {
            type: 'state',
            common: {
                name: name,
                role: 'value',
                type: 'mixed',
                unit: unit,
                desc: desc
            },
            native: {}
        });
        adapter.setState(senderID + '.' + key, {val: varValue, ack: true});
    });
});

function listSerial() {
    path = path || require('path');
    fs   = fs   || require('fs');

    // Filter out the devices that aren't serial ports
    var devDirName = '/dev';

    var result;
    try {
        result = fs
            .readdirSync(devDirName)
            .map(function (file) {
                return path.join(devDirName, file);
            })
            .filter(filterSerialPorts)
            .map(function (port) {
                return {comName: port};
            });
    } catch (e) {
        adapter.log.error('Cannot read "' + devDirName + '": ' + e);
        result = [];
    }
    return result;
}

eo.on("data",function(data){
    //adapter.log.debug('Recived data: ' + JSON.stringify(data));
});