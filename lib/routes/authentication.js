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
var User = __importStar(require("../models/user"));
var Otp = __importStar(require("../models/otp"));
var Token = __importStar(require("../models/token"));
var SMSService = __importStar(require("../service/smsService"));
router.get("/login", function (req, res) {
    if (req.headers.authorization) {
        var carrier = req.headers.authorization.split(" ")[0];
        var encoded = req.headers.authorization.split(" ")[1];
        if (encoded && carrier && carrier.toLowerCase() === "basic") {
            var decoded = new Buffer(encoded, "base64").toString("utf8");
            var emailOrMobile = decoded.split(":")[0];
            var password = decoded.split(":")[1];
            User.findByEmailOrMobile(emailOrMobile, function (err, user) {
                if (err || !user) {
                    winston_1.logger.warn("User not found: + " + emailOrMobile);
                    var responseObj = new models_1.ResponseObj(404, "User not found", undefined);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                else {
                    if (user.isDeleted || !user.isEnabled) {
                        winston_1.logger.warn("User disabled or deleted: + " + emailOrMobile);
                        var responseObj = new models_1.ResponseObj(400, "Your account has been disabled, please contact your Administrator", undefined);
                        res.status(responseObj.status).json(responseObj);
                        return;
                    }
                    if (!user.isMobileVerified) {
                        winston_1.logger.warn("User mobile is not verified for: + " + emailOrMobile);
                        var responseObj = new models_1.ResponseObj(400, "Please verify your mobile number to login", undefined);
                        res.status(responseObj.status).json(responseObj);
                        return;
                    }
                    User.compareSaltedPassword(password, user.password, function (pwdErr, isMatch) {
                        if (isMatch) {
                            var userJson_1 = JSON.stringify(user);
                            userJson_1 = JSON.parse(userJson_1);
                            generateAndSaveToken(userJson_1, function (token, expiresAt) {
                                if (!token || !expiresAt) {
                                    winston_1.logger.error("Token generation failure");
                                    var responseObj_1 = new models_1.ResponseObj(500, "Internal Error", null);
                                    res.status(responseObj_1.status).json(responseObj_1);
                                    return;
                                }
                                delete userJson_1.password;
                                //delete userJson._id;
                                delete userJson_1.updatedAt;
                                delete userJson_1.isDeleted;
                                delete userJson_1.isEnabled;
                                delete userJson_1.resourceId;
                                delete userJson_1.__v;
                                userJson_1.token = token;
                                userJson_1.tokenExpiresAt = expiresAt;
                                var responseObj = new models_1.ResponseObj(200, "Success", userJson_1);
                                res.status(responseObj.status).json(responseObj);
                            });
                        }
                        else {
                            winston_1.logger.error("Incorrect Password for: + " + emailOrMobile);
                            var responseObj = new models_1.ResponseObj(400, "Incorrect Password", undefined);
                            res.status(responseObj.status).json(responseObj);
                            //res.redirect('index');
                        }
                    });
                }
            });
        }
        else {
            winston_1.logger.warn("Invalid carrier or auth");
            var responseObj = new models_1.ResponseObj(400, "Invalid carrier or auth", undefined);
            res.status(responseObj.status).json(responseObj);
        }
    }
    else {
        winston_1.logger.warn("No authorization header.");
        var responseObj = new models_1.ResponseObj(400, "Missing authorization header", undefined);
        res.status(responseObj.status).json(responseObj);
    }
});
router.get("/refresh", passport_1.default.authenticate("bearer", { session: false }), function (req, res) {
    var user = req.user;
    var userJson = JSON.stringify(user);
    userJson = JSON.parse(userJson);
    generateAndSaveToken(userJson, function (token, expiresAt) {
        if (!token || !expiresAt) {
            winston_1.logger.error("Token generation failure");
            var responseObj_2 = new models_1.ResponseObj(500, "Internal Error", null);
            res.status(responseObj_2.status).json(responseObj_2);
            return;
        }
        delete userJson.password;
        delete userJson._id;
        delete userJson.updatedAt;
        delete userJson.isDeleted;
        delete userJson.isEnabled;
        delete userJson.__v;
        userJson.token = token;
        userJson.tokenExpiresAt = expiresAt;
        var responseObj = new models_1.ResponseObj(200, "Success", userJson);
        res.status(responseObj.status).json(responseObj);
    });
});
router.post("/signup", function (req, res) {
    if (!req.body.email) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'email'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    if (!req.body.mobile) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'mobile'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    if (!req.body.password) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'password'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    if (!req.body.repassword) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'confirm password'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    var email = req.body.email;
    var mobile = req.body.mobile;
    var password = req.body.password;
    var repassword = req.body.repassword;
    var fullname = req.body.fullname;
    if (email.length === 0 || mobile.length === 0 || password.length === 0) {
        var responseObj = new models_1.ResponseObj(400, "email/phone number/password must be provided", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    User.findByEmailOrMobile(email, function (err, userDetails) {
        if (err) {
            var responseObj = new models_1.ResponseObj(404, "Failed to signup user", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
        if (userDetails) {
            var responseObj = new models_1.ResponseObj(400, "User already exists with this email: " + email, null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
        User.findByEmailOrMobile(mobile, function (err, userDetails) {
            if (err) {
                var responseObj = new models_1.ResponseObj(404, "Failed to signup user", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            if (userDetails) {
                var responseObj = new models_1.ResponseObj(400, "User already exists with this phone number: " + mobile, null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            if (password !== repassword) {
                var responseObj = new models_1.ResponseObj(400, "Passwords do not match", null);
                res.status(responseObj.status).json(responseObj);
                return;
            }
            var user = new User.UserModel({
                email: email,
                mobile: mobile,
                fullname: fullname,
                password: password
            });
            User.createSaltedPassword(user.password, function (err, hashedPassword) {
                if (err) {
                    var responseObj = new models_1.ResponseObj(500, "Failed to encrypt password!", null);
                    res.status(responseObj.status).json(responseObj);
                    return;
                }
                user.password = hashedPassword;
                User.createUser(user, function (err, r) {
                    if (err) {
                        var responseObj = new models_1.ResponseObj(500, "Failed to create user: " + email, null);
                        res.status(responseObj.status).json(responseObj);
                        return;
                    }
                    var otp = getOtp();
                    var otpMessage = otp + " is your otp for Shoe Factory";
                    var otpObj = new Otp.OtpModel({
                        otp: otp,
                        userId: user.id
                    });
                    Otp.createOtp(otpObj, function (otpError) {
                        if (otpError) {
                            winston_1.logger.error("Failed to generate OTP");
                        }
                        SMSService.sendSms(otpMessage, user.mobile);
                        var responseObj = new models_1.ResponseObj(200, "Success", {
                            otpId: otpObj.id
                        });
                        res.status(responseObj.status).json(responseObj);
                    });
                });
            });
        });
    });
});
router.post("/otp", function (req, res) {
    if (!req.body.otp) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'otp'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    if (!req.body.otpId) {
        var responseObj = new models_1.ResponseObj(400, "Missing parameter 'otpId'", null);
        res.status(responseObj.status).json(responseObj);
        return;
    }
    var otp = parseInt(req.body.otp);
    var otpId = req.body.otpId;
    Otp.findByOtpId(otpId, function (err, otpObj) {
        if (err || !otpObj) {
            var responseObj = new models_1.ResponseObj(404, "Invalid OTP", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
        if (otpObj.otp !== otp) {
            var responseObj = new models_1.ResponseObj(400, "Invalid or Incorrect OTP", null);
            res.status(responseObj.status).json(responseObj);
            return;
        }
        User.findByUserId(otpObj.userId, false, function (userErr, userObj) {
            if (userErr || !userObj) {
                var responseObj_3 = new models_1.ResponseObj(404, "User details not found!", null);
                res.status(responseObj_3.status).json(responseObj_3);
                return;
            }
            var responseObj = new models_1.ResponseObj(200, "Success", {
                otpId: otpObj.id
            });
            res.status(responseObj.status).json(responseObj);
            userObj.isMobileVerified = true;
            User.updateUserByEmail(userObj.email, userObj, function (userErr, result) {
                if (userErr) {
                    winston_1.logger.error("Failed to verify mobile for user: " + userObj.email);
                }
            });
        });
    });
});
/************** Helper Functions ******************/
var jwtSecret = "R434dgeRTsd5GsdGHRD35";
function generateAndSaveToken(user, cb) {
    var token = jsonwebtoken_1.default.sign({ email: user.email }, jwtSecret, {
        expiresIn: Token.TOKEN_EXPIRY * 60
    });
    Token.updateToken(token, user._id, function (err, result) {
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
function getOtp() {
    var min = 100000;
    var max = 999999;
    return Math.floor(Math.random() * (max - min)) + min;
}
module.exports = router;
