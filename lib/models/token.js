"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.TOKEN_EXPIRY = 30; // Im Minutes
var TokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        index: true,
        unique: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        index: true
        //unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: exports.TOKEN_EXPIRY * 60
    }
}, {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
});
exports.TokenModel = mongoose_1.model("tokens", TokenSchema);
exports.updateToken = function (token, userId, cb) {
    var tokenObj = new exports.TokenModel({ token: token, userId: userId });
    tokenObj.save(function (err, result) {
        cb(err, result);
    });
};
exports.findByToken = function (token, cb) {
    exports.TokenModel.findOne({ token: token }, function (err, result) {
        cb(err, result);
    });
};
