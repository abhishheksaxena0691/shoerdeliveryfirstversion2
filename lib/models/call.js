"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
//Call Direction with reference to internal user
var CallDirection;
(function (CallDirection) {
    CallDirection["from"] = "FROM";
    CallDirection["to"] = "TO";
})(CallDirection = exports.CallDirection || (exports.CallDirection = {}));
var CallSchema = new mongoose_1.Schema({
    agentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "agents"
    },
    internalUser: String,
    externalUser: String,
    direction: String,
    raw: String,
    rtt: String,
    callDuration: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        expires: "180d"
    }
}, {
    usePushEach: true,
    bufferCommands: false
});
exports.CallModel = mongoose_1.model("calls", CallSchema);
