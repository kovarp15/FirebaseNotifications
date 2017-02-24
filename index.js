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

    this.handler = this.onNotificationHandler();

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
        overlay: {
            deviceType: 'switchBinary'
        },
        handler: function (command, args) {

            if(command == 'on') {

                // If API Key from Firebase and Device ID exist, then send notification
                if (self.config.api_key && self.config.device_id) {
                    http.request({
                        method: 'POST',
                        url: 'https://fcm.googleapis.com/fcm/send',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'key=' + self.config.api_key
                        },
                        data: JSON.stringify({
                            to: self.config.device_id,
                            data: {
                                text: "Notifications on"
                            }
                        }),
                        timeout: 10000,
                        async: true,
                        success: function (response) {
                            console.log("STATUS: \n" + response.status);
                            console.log("BODY: \n" + response.data);
                        },
                        error: function (response) {
                            console.log("STATUS: \n" + response.status);
                            console.log("BODY: \n" + response.data);
                            console.log("Can not make request: " + response.statusText); // don't add it to notifications, since it will fill all the notifcations on error
                        }
                    });
                }

            } else if (command == 'off') {

                // If API Key from Firebase and Device ID exist, then send notification
                if (self.config.api_key && self.config.device_id) {
                    http.request({
                        method: 'POST',
                        url: 'https://fcm.googleapis.com/fcm/send',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'key=' + self.config.api_key
                        },
                        data: JSON.stringify({
                            to: self.config.device_id,
                            data: {
                                text: "Notifications off"
                            }
                        }),
                        timeout: 10000,
                        async: true,
                        success: function (response) {
                            console.log("STATUS: \n" + response.status);
                            console.log("BODY: \n" + response.data);
                        },
                        error: function (response) {
                            console.log("STATUS: \n" + response.status);
                            console.log("BODY: \n" + response.data);
                            console.log("Can not make request: " + response.statusText); // don't add it to notifications, since it will fill all the notifcations on error
                        }
                    });
                }

            }

            //self.vDev.set("metrics:level", "on"); // update on ourself to allow catch this event
        },
        moduleId: this.id
    });

    this.controller.on('notifications.push', this.handler);

};

FirebaseModule.prototype.onNotificationHandler = function () {
    var self = this;

    return function(notice) {
        if (self.config.api_key && self.config.device_id) {
            http.request({
                method: 'POST',
                url: 'https://fcm.googleapis.com/fcm/send',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'key=' + self.config.api_key
                },
                data: JSON.stringify({
                    to: self.config.device_id,
                    data: {
                        text: notice.message
                    }
                }),
                timeout: 10000,
                async: true,
                success: function(response) {
                    console.log("Firebase notification successfully sent.");
                },
                error: function(response) {
                    console.log("Firebase notification failed: " + response.statusText); // don't add it to notifications, since it will fill all the notifcations on error
                }
            });
        }
    }
};


FirebaseModule.prototype.stop = function () {

    if (this.vDev) {
        this.controller.devices.remove(this.vDev.id);
        this.vDev = null;
    }

    FirebaseModule.super_.prototype.stop.call(this);

    this.controller.off('notifications.push', this.handler);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------