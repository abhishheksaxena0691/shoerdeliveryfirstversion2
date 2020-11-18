"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
var passport_1 = __importDefault(require("passport"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var moment_1 = __importDefault(require("moment"));
var models_1 = require("../models/models");
var winston_1 = require("../config/winston");
var Agent = __importStar(require("../models/agent"));
var Token = __importStar(require("../models/token"));
router.get("/login", function (req, res) {
    if (req.headers.authorization) {
        var carrier = req.headers.authorization.split(" ")[0];
        var encoded = req.headers.authorization.split(" ")[1];
        if (encoded && carrier && carrier.toLowerCase() === "basic") {
            var decoded = new Buffer(encoded, "base64").toString("utf8");
            var email = decoded.split(":")[0];
            var password = decoded.split(":")[1];
            Agent.findByEmail(email, function (err, agent) {
                if (err || !agent) {
                    winston_1.logger.warn("User not found: + " + email);
                    var responseObj = new models_1.ResponseObj(404, "User not fount", undefined);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                else {
                    if (agent.isDeleted || !agent.isEnabled) {
                        winston_1.logger.warn("Agent disabled or deleted: + " + email);
                        var responseObj = new models_1.ResponseObj(400, "Your account has been disabled, please contact your Administrator", undefined);
                        res.status(responseObj.status).json(responseObj);
                        return;
                    }
                    Agent.compareSaltedPassword(password, agent.password, function (pwdErr, isMatch) {
                        if (isMatch) {
                            var agentJson_1 = JSON.stringify(agent);
                            agentJson_1 = JSON.parse(agentJson_1);
                            generateAndSaveToken(agentJson_1, function (token, expiresAt) {
                                if (!token || !expiresAt) {
                                    winston_1.logger.error("Token generation failure");
                                    var responseObj_1 = new models_1.ResponseObj(500, "Internal Error", null);
                                    res.status(responseObj_1.status).json(responseObj_1);
                                    return;
                                }
                                delete agentJson_1.password;
                                delete agentJson_1._id;
                                delete agentJson_1.updatedAt;
                                delete agentJson_1.isDeleted;
                                delete agentJson_1.isEnabled;
                                delete agentJson_1.__v;
                                agentJson_1.token = token;
                                agentJson_1.tokenExpiresAt = expiresAt;
                                var responseObj = new models_1.ResponseObj(200, "Success", agentJson_1);
                                res.status(responseObj.status).json(responseObj);
                            });
                        }
                        else {
                            winston_1.logger.error("Incorrect Password for: + " + email);
                            var responseObj = new models_1.ResponseObj(400, "Incorrect Password", undefined);
                            res.status(responseObj.status).json(responseObj);
                        }
                    });
                }
            });
        }
        else {
            winston_1.logger.silly("Invalid carrier or auth");
            var responseObj = new models_1.ResponseObj(400, "Invalid carrier or auth", undefined);
            res.status(responseObj.status).json(responseObj);
        }
    }
    else {
        winston_1.logger.silly("No authorization header.");
        var responseObj = new models_1.ResponseObj(400, "Missing authorization header", undefined);
        res.status(responseObj.status).json(responseObj);
    }
});
router.get("/refresh", passport_1.default.authenticate("bearer", { session: false }), function (req, res) {
    var agent = req.user;
    var agentJson = JSON.stringify(agent);
    agentJson = JSON.parse(agentJson);
    generateAndSaveToken(agentJson, function (token, expiresAt) {
        if (!token || !expiresAt) {
            winston_1.logger.error("Token generation failure");
            var responseObj_2 = new models_1.ResponseObj(500, "Internal Error", null);
            res.status(responseObj_2.status).json(responseObj_2);
            return;
        }
        delete agentJson.password;
        delete agentJson._id;
        delete agentJson.updatedAt;
        delete agentJson.isDeleted;
        delete agentJson.isEnabled;
        delete agentJson.__v;
        agentJson.token = token;
        agentJson.tokenExpiresAt = expiresAt;
        var responseObj = new models_1.ResponseObj(200, "Success", agentJson);
        res.status(responseObj.status).json(responseObj);
    });
});
router.get("/index2", function (req, res) {
    passport_1.default.authenticate("bearer", { session: false });
    res.render("test/test", {
        title: "VCaption",
        relPath: "../"
    });
});
// router.get("/connect-with-agent", function(req, res) {
//   res.render("connect-with-agent", {
//     title: "VCaption"
//   });
// });
/************** Helper Functions ******************/
var jwtSecret = "R434dgeRTsd5GsdGHRD35";
function generateAndSaveToken(agent, cb) {
    var token = jsonwebtoken_1.default.sign({ email: agent.email }, jwtSecret, {
        expiresIn: Token.TOKEN_EXPIRY * 60
    });
    Token.updateToken(token, agent._id, function (err, result) {
        if (err || !result) {
            winston_1.logger.error("Error saving token: " + err);
            cb(null, null);
        }
        else {
            winston_1.logger.silly("Token details: " + result);
            var expiresAt = moment_1.default(result.createdAt)
                .add(Token.TOKEN_EXPIRY, "m")
                .utc();
            cb(token, expiresAt);
        }
    });
}
module.exports = router;
