"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType["appidentification"] = "APP_IDENTIFICATION";
    MessageType["webidentification"] = "WEB_IDENTIFICATION";
    MessageType["rtt"] = "RTT";
    MessageType["rttspecial"] = "RTT_SPECIAL";
    MessageType["callhistory"] = "CALL_HISTORY";
    MessageType["messageHistory"] = "MESSAGE_HISTORY";
    MessageType["connectionDetails"] = "CONNECTION_DETAILS";
    MessageType["disconnect"] = "disconnect";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var RttSpecialType;
(function (RttSpecialType) {
    RttSpecialType["backspace"] = "BACKSPACE";
    RttSpecialType["newLine"] = "NEW_LINE";
})(RttSpecialType = exports.RttSpecialType || (exports.RttSpecialType = {}));
var Message = /** @class */ (function () {
    function Message(data, keyCode, deviceId, rttSpecial) {
        this.data = data;
        this.keyCode = keyCode;
        this.deviceId = deviceId;
        this.rttSpecial = rttSpecial;
    }
    return Message;
}());
exports.Message = Message;
var ResponseObj = /** @class */ (function () {
    function ResponseObj(status, message, data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
    ResponseObj.prototype.toJson = function () {
        return { status: this.status, message: this.message, data: this.data };
    };
    ResponseObj.prototype.toJsonString = function () {
        return JSON.stringify({ status: this.status, message: this.message, data: this.data });
    };
    return ResponseObj;
}());
exports.ResponseObj = ResponseObj;
