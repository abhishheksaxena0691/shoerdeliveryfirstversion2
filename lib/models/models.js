"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType["USER_IDENTIFICATION"] = "USER_IDENTIFICATION";
    MessageType["BOT_IDENTIFICATION"] = "BOT_IDENTIFICATION";
    MessageType["BROCHURE_READY"] = "BROCHURE_READY";
    MessageType["ERROR"] = "ERROR";
    MessageType["DISCONNECT"] = "disconnect";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var Message = /** @class */ (function () {
    function Message(data, files) {
        this.data = data;
        this.files = files;
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
