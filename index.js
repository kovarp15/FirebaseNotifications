/*** FirebaseModule Z-Way HA module *******************************************

 Version: 1.0.0
 (c) Petr Kovář, 2017
 -----------------------------------------------------------------------------
 Author: Petr Kovář <kovarp15@fel.cvut.cz>
 Description:
 This module allows to send event notifications via Firebase
 server https://github.com/kovarp15/FirebaseModule

 ******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------

function FirebaseModule (id, controller) {
    // Call superconstructor first (AutomationModule)
    FirebaseModule.super_.call(this, id, controller);

}

inherits(FirebaseModule, AutomationModule);

_module = FirebaseModule;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

FirebaseModule.prototype.init = function (config) {
    FirebaseModule.super_.prototype.init.call(this, config);

    var self = this;

    this.vDev = this.controller.devices.create({
        deviceId: "Firebase_" + this.id,
        defaults: {
            deviceType: "toggleButton",
            metrics: {
                level: 'on', // it is always on, but usefull to allow bind
                icon: '',
                title: 'Firebase ' + this.id
            }
        },
        overlay: {},
        handler: function () {

            // If API Key from mandrillapp.com and Email exist, then send email
            if (self.config.api_key && self.config.device_id) {
                console.log("POST: " + "key=" + self.config.api_key);
                http.request({
                    method: 'POST',
                    url: 'https://fcm.googleapis.com/fcm/send',
                    contentType: "application/json",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=' + self.config.api_key
                    },
                    data: JSON.stringify(
                        { "data": {
                            "message": "Hello World!"
                        },
                            "to" : self.config.device_id
                        }
                    ),
                    async: true,
                    success: function(response) {
                        console.log("STATUS: \n" + response.status);
                        console.log("BODY: \n" + response.body);
                    },
                    error: function(response) {
                        console.log("STATUS: \n" + response.status);
                        console.log("BODY: \n" + response.body);
                        console.log("Can not make request: " + response.statusText); // don't add it to notifications, since it will fill all the notifcations on error
                    }
                });
            }

            self.vDev.set("metrics:level", "on"); // update on ourself to allow catch this event
        },
        moduleId: this.id
    });

    /*self.vDev = this.controller.devices.create({
        deviceId: "SecurityZone_"+this.id,
        defaults: {
            metrics: {
                triggeredDevices: [],
                level: 'off',
                state: 'off',
                title: self.langFile.m_title+' '+self.langFile['type_'+self.config.type],
                icon: self.imagePath+"/icon.png"
            }
        },
        overlay: {
            metrics: {
                securityType: self.type
            },
            probeType: 'controller_security',
            deviceType: 'switchBinary'
        },
        handler: function(command, args) {
            if (command !== 'on'
                && command !== 'off') {
                return;
            }
            self.changeState(command);
        },
        moduleId: this.id
    });*/

};


FirebaseModule.prototype.stop = function () {

    if (this.vDev) {
        this.controller.devices.remove(this.vDev.id);
        this.vDev = null;
    }

    FirebaseModule.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------