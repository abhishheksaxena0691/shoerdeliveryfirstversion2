"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("https");
var config_1 = require("../config/config");
var winston_1 = require("../config/winston");
var config = new config_1.Config();
var options = {
    method: "POST",
    hostname: "api.msg91.com",
    port: null,
    path: "/api/v2/sendsms?country=91",
    headers: {
        authkey: config.msg91authKey,
        "content-type": "application/json"
    }
};
exports.sendSms = function (message, mobile) {
    var req = http.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            winston_1.logger.debug("SMS response: " + body.toString());
        });
    });
    req.write(JSON.stringify({
        sender: "SHOEFP",
        route: "4",
        country: "91",
        sms: [{ message: message, to: [mobile] }]
    }));
    req.end();
};
