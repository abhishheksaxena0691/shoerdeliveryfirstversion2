"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var HelpStatus;
(function (HelpStatus) {
    HelpStatus["PENDING"] = "PENDING";
    HelpStatus["COMPLETED"] = "COMPLETED";
})(HelpStatus = exports.HelpStatus || (exports.HelpStatus = {}));
var HelpSchema = new mongoose_1.Schema({
    question: String,
    answer: {
        type: String,
        default: ""
    },
    status: {
        type: HelpStatus,
        default: HelpStatus.PENDING
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
});
exports.HelpModel = mongoose_1.model("helps", HelpSchema);
exports.findByQuestionAndUserId = function (question, userId, cb) {
    exports.HelpModel.findOne({ question: question, userId: userId }, function (err, helpObj) {
        cb(err, helpObj);
    });
};
exports.findByHelpId = function (helpId, cb) {
    exports.HelpModel.findById(helpId, function (err, helpObj) {
        cb(err, helpObj);
    });
};
exports.findAllByUserId = function (userId, cb) {
    exports.HelpModel.find({ userId: userId }, function (err, helpObj) {
        cb(err, helpObj);
    });
};
exports.createHelp = function (helpObj, cb) {
    exports.HelpModel.insertMany([helpObj], function (err, result) {
        cb(err, result);
    });
};
