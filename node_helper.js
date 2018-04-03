/* Magic Mirror
 * Node Helper: MMM-PimaticFloorplan
 *
 * marcelwinh
 *  Created:       02.04.2018
 *  Last modified: 02.04.2018
 *
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var io = require('socket.io-client');

module.exports = NodeHelper.create({
	start: function () {
        console.log(this.name + ' helper started ...');
	},
    
    // connect to pimatic home automation server and listen on device attribute changes
    connectToPimatic: function (config) {
        var self = this;
        var deviceValues = [];

        // connect to Pimatic server

		var url = 'http://' + config.pimatic.host + ':' + config.pimatic.port + '/?username=' + config.pimatic.user + '&password=' + config.pimatic.passwd;
		console.log(url);
        var socket = io(url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 3000,
          timeout: 20000,
          forceNew: true
        });
        
        // get actual values of pimatic variables
        socket.on('variables', function(variables){         
            self.sendSocketNotification('PIMATIC_VARIABLES', variables);
        });

        // receive and forward pimatic device attribute changes   
        socket.on('deviceAttributeChanged', function(attrEvent) { 
            //console.log(attrEvent)
            self.sendSocketNotification('PIMATIC_ATTRIBUTE_CHANGED', attrEvent);
        })              
	},    

    // notifications from main modul
	socketNotificationReceived: function (notification, payload) {
        if (notification == 'CONNECT') {
            this.connectToPimatic(payload);             // Connect and listen to pimatic host
		}  
    },
})

