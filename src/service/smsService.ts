let http = require("https");
import { Config } from "../config/config";
import { logger } from "../config/winston";

const config = new Config();

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

export let sendSms = function(message: string, mobile: string) {
  var req = http.request(options, function(res: any) {
    var chunks:any = [];

    res.on("data", function(chunk:any) {
      chunks.push(chunk);
    });

    res.on("end", function() {
      var body = Buffer.concat(chunks);
      logger.debug("SMS response: " + body.toString());
    });
  });

  req.write(
    JSON.stringify({
      sender: "SHOEFP",
      route: "4",
      country: "91",
      sms: [{ message: message, to: [mobile] }]
    })
  );
  req.end();
};
