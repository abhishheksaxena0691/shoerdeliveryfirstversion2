"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.OTP_EXPIRY = 15; // Im Minutes
var OtpSchema = new mongoose_1.Schema({
    otp: Number,
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: exports.OTP_EXPIRY * 60
    }
}, {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
});
exports.OtpModel = mongoose_1.model("otps", OtpSchema);
exports.findByOtpAndUserId = function (otp, userId, cb) {
    exports.OtpModel.findOne({ otp: otp, userId: userId }, function (err, otpObj) {
        cb(err, otpObj);
    });
};
exports.findByOtpId = function (otpId, cb) {
    exports.OtpModel.findById(otpId, function (err, otpObj) {
        cb(err, otpObj);
    });
};
exports.createOtp = function (otpObj, cb) {
    exports.OtpModel.insertMany([otpObj], function (err, result) {
        cb(err, result);
    });
};
