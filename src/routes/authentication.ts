import express from "express";
let router = express.Router();
import passport from "passport";
import jwt from "jsonwebtoken";
import moment from "moment";
import { ResponseObj } from "../models/models";
import { logger } from "../config/winston";
import * as User from "../models/user";
import * as Otp from "../models/otp";
import * as Token from "../models/token";
import * as SMSService from "../service/smsService";

router.get("/login", function(req: any, res: any) {
  if (req.headers.authorization) {
    var carrier = req.headers.authorization.split(" ")[0];
    var encoded = req.headers.authorization.split(" ")[1];

    if (encoded && carrier && carrier.toLowerCase() === "basic") {
      var decoded = new Buffer(encoded, "base64").toString("utf8");

      var emailOrMobile = decoded.split(":")[0];
      var password = decoded.split(":")[1];

      User.findByEmailOrMobile(emailOrMobile, function(err: Error, user: any) {
        if (err || !user) {
          logger.warn("User not found: + " + emailOrMobile);

          let responseObj = new ResponseObj(404, "User not found", undefined);
          res.status(responseObj.status).json(responseObj);
          return;
        } else {
          if (user.isDeleted || !user.isEnabled) {
            logger.warn("User disabled or deleted: + " + emailOrMobile);

            let responseObj = new ResponseObj(
              400,
              "Your account has been disabled, please contact your Administrator",
              undefined
            );
            res.status(responseObj.status).json(responseObj);
            return;
          }
          if (!user.isMobileVerified) {
            logger.warn("User mobile is not verified for: + " + emailOrMobile);

            let responseObj = new ResponseObj(
              400,
              "Please verify your mobile number to login",
              undefined
            );
            res.status(responseObj.status).json(responseObj);
            return;
          }
          User.compareSaltedPassword(password, user.password, function(
            pwdErr: Error,
            isMatch: boolean
          ) {
            if (isMatch) {
              let userJson: any = JSON.stringify(user);
              userJson = JSON.parse(userJson);

              generateAndSaveToken(userJson, function(
                token: string,
                expiresAt: Date
              ) {
                if (!token || !expiresAt) {
                  logger.error("Token generation failure");
                  let responseObj = new ResponseObj(
                    500,
                    "Internal Error",
                    null
                  );
                  res.status(responseObj.status).json(responseObj);
                  return;
                }
                delete userJson.password;
                //delete userJson._id;
                delete userJson.updatedAt;
                delete userJson.isDeleted;
                delete userJson.isEnabled;
                delete userJson.resourceId;
                delete userJson.__v;
                userJson.token = token;
                userJson.tokenExpiresAt = expiresAt;

                let responseObj = new ResponseObj(200, "Success", userJson);
                res.status(responseObj.status).json(responseObj);
              });
            } else {
              logger.error("Incorrect Password for: + " + emailOrMobile);

              let responseObj = new ResponseObj(
                400,
                "Incorrect Password",
                undefined
              );
              res.status(responseObj.status).json(responseObj);
              //res.redirect('index');
            }
          });
        }
      });
    } else {
      logger.warn("Invalid carrier or auth");

      let responseObj = new ResponseObj(
        400,
        "Invalid carrier or auth",
        undefined
      );
      res.status(responseObj.status).json(responseObj);
    }
  } else {
    logger.warn("No authorization header.");

    let responseObj = new ResponseObj(
      400,
      "Missing authorization header",
      undefined
    );
    res.status(responseObj.status).json(responseObj);
  }
});

router.get(
  "/refresh",
  passport.authenticate("bearer", { session: false }),
  function(req: any, res: any) {
    const user = req.user;
    let userJson: any = JSON.stringify(user);
    userJson = JSON.parse(userJson);

    generateAndSaveToken(userJson, function(token: string, expiresAt: Date) {
      if (!token || !expiresAt) {
        logger.error("Token generation failure");
        let responseObj = new ResponseObj(500, "Internal Error", null);
        res.status(responseObj.status).json(responseObj);
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

      let responseObj = new ResponseObj(200, "Success", userJson);
      res.status(responseObj.status).json(responseObj);
    });
  }
);

router.post("/signup", function(req: any, res: any) {
  if (!req.body.email) {
    let responseObj = new ResponseObj(400, "Missing parameter 'email'", null);
    res.status(responseObj.status).json(responseObj);
    return;
  }
  if (!req.body.mobile) {
    let responseObj = new ResponseObj(400, "Missing parameter 'mobile'", null);
    res.status(responseObj.status).json(responseObj);
    return;
  }
  if (!req.body.password) {
    let responseObj = new ResponseObj(
      400,
      "Missing parameter 'password'",
      null
    );
    res.status(responseObj.status).json(responseObj);
    return;
  }
  if (!req.body.repassword) {
    let responseObj = new ResponseObj(
      400,
      "Missing parameter 'confirm password'",
      null
    );
    res.status(responseObj.status).json(responseObj);
    return;
  }
  let email = req.body.email;
  let mobile = req.body.mobile;
  let password = req.body.password;
  let repassword = req.body.repassword;
  let fullname = req.body.fullname;

  if (email.length === 0 || mobile.length === 0 || password.length === 0) {
    let responseObj = new ResponseObj(
      400,
      "email/phone number/password must be provided",
      null
    );
    res.status(responseObj.status).json(responseObj);
    return;
  }

  User.findByEmailOrMobile(email, function(err: Error, userDetails: any) {
    if (err) {
      let responseObj = new ResponseObj(404, "Failed to signup user", null);
      res.status(responseObj.status).json(responseObj);
      return;
    }

    if (userDetails) {
      let responseObj = new ResponseObj(
        400,
        "User already exists with this email: " + email,
        null
      );
      res.status(responseObj.status).json(responseObj);
      return;
    }

    User.findByEmailOrMobile(mobile, function(err: Error, userDetails: any) {
      if (err) {
        let responseObj = new ResponseObj(404, "Failed to signup user", null);
        res.status(responseObj.status).json(responseObj);
        return;
      }
      if (userDetails) {
        let responseObj = new ResponseObj(
          400,
          "User already exists with this phone number: " + mobile,
          null
        );
        res.status(responseObj.status).json(responseObj);
        return;
      }

      if (password !== repassword) {
        let responseObj = new ResponseObj(400, "Passwords do not match", null);
        res.status(responseObj.status).json(responseObj);
        return;
      }
      const user = new User.UserModel({
        email: email,
        mobile: mobile,
        fullname: fullname,
        password: password
      });

      User.createSaltedPassword(user.password, function(
        err: any,
        hashedPassword: string
      ) {
        if (err) {
          let responseObj = new ResponseObj(
            500,
            "Failed to encrypt password!",
            null
          );
          res.status(responseObj.status).json(responseObj);
          return;
        }
        user.password = hashedPassword;
        User.createUser(user, function(err: any, r: any) {
          if (err) {
            let responseObj = new ResponseObj(
              500,
              "Failed to create user: " + email,
              null
            );
            res.status(responseObj.status).json(responseObj);
            return;
          }

          const otp = getOtp();
          const otpMessage = otp + " is your otp for Shoe Factory";
          const otpObj = new Otp.OtpModel({
            otp: otp,
            userId: user.id
          });

          Otp.createOtp(otpObj, function(otpError: any) {
            if (otpError) {
              logger.error("Failed to generate OTP");
            }

            SMSService.sendSms(otpMessage, user.mobile);

            let responseObj = new ResponseObj(200, "Success", {
              otpId: otpObj.id
            });
            res.status(responseObj.status).json(responseObj);
          });
        });
      });
    });
  });
});

router.post("/otp", function(req: any, res: any) {
  if (!req.body.otp) {
    let responseObj = new ResponseObj(400, "Missing parameter 'otp'", null);
    res.status(responseObj.status).json(responseObj);
    return;
  }
  if (!req.body.otpId) {
    let responseObj = new ResponseObj(400, "Missing parameter 'otpId'", null);
    res.status(responseObj.status).json(responseObj);
    return;
  }
  let otp = parseInt(req.body.otp);
  let otpId = req.body.otpId;

  Otp.findByOtpId(otpId, function(err: Error, otpObj: any) {
    if (err || !otpObj) {
      let responseObj = new ResponseObj(404, "Invalid OTP", null);
      res.status(responseObj.status).json(responseObj);
      return;
    }

    if (otpObj.otp !== otp) {
      let responseObj = new ResponseObj(400, "Invalid or Incorrect OTP", null);
      res.status(responseObj.status).json(responseObj);
      return;
    }

    User.findByUserId(otpObj.userId, false, function(
      userErr: any,
      userObj: any
    ) {
      if (userErr || !userObj) {
        let responseObj = new ResponseObj(404, "User details not found!", null);
        res.status(responseObj.status).json(responseObj);
        return;
      }

      let responseObj = new ResponseObj(200, "Success", {
        otpId: otpObj.id
      });
      res.status(responseObj.status).json(responseObj);

      userObj.isMobileVerified = true;

      User.updateUserByEmail(userObj.email, userObj, function(
        userErr: any,
        result: any
      ) {
        if (userErr) {
          logger.error(
            "Failed to verify mobile for user: " + userObj.email
          );
        }
      });
    });
  });
});

/************** Helper Functions ******************/
const jwtSecret = "R434dgeRTsd5GsdGHRD35";
function generateAndSaveToken(user: any, cb: Function) {
  let token = jwt.sign({ email: user.email }, jwtSecret, {
    expiresIn: Token.TOKEN_EXPIRY * 60
  });

  Token.updateToken(token, user._id, function(err: Error, result: any) {
    if (err || !result) {
      logger.error("Error saving token: " + err);
      cb(null, null);
    } else {
      logger.silly("Token details: " + result);
      let expiresAt = moment(result.createdAt)
        .add(Token.TOKEN_EXPIRY, "m")
        .utc();
      cb(token, expiresAt);
    }
  });
}

function getOtp() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = router;
