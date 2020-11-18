"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var socketio = __importStar(require("socket.io"));
var models_1 = require("../models/models");
var connectionList = {};
var Socket = /** @class */ (function () {
    function Socket(server) {
        this.init(server);
    }
    Socket.prototype.init = function (server) {
        var _this = this;
        this.io = socketio.listen(server);
        this.io.on("connection", function (socket) {
            var app;
            var web;
            console.log("user connected");
            connectionList[socket.id] = {};
            if (_this.io) {
                _this.io.emit(models_1.MessageType.connectionDetails, connectionList);
            }
            socket.on(models_1.MessageType.appidentification, function (m) {
                app = m.data;
                connectionList[socket.id].app = app;
                console.log(m.data + " : has joined");
                if (_this.io) {
                    _this.io.emit(models_1.MessageType.connectionDetails, connectionList);
                }
                //socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
            });
            socket.on(models_1.MessageType.webidentification, function (m) {
                web = m.data;
                connectionList[socket.id].web = web;
                console.log(m.data + " : has joined");
                if (_this.io) {
                    _this.io.emit(models_1.MessageType.connectionDetails, connectionList);
                }
                //socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
            });
            socket.on(models_1.MessageType.rtt, function (m) {
                console.log("New Message (" + m.deviceId + "): " + m.data);
                if (_this.io && _this.io.sockets.connected[m.deviceId]) {
                    _this.io.sockets.connected[m.deviceId].emit(models_1.MessageType.rtt, m);
                }
                //socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
            });
            socket.on(models_1.MessageType.rttspecial, function (m) {
                console.log("Special Message: " + m.data + ", " + m.keyCode);
                if (_this.io && _this.io.sockets.connected[m.deviceId]) {
                    if (m.keyCode === 13) {
                        m.rttSpecial = models_1.RttSpecialType.newLine;
                    }
                    else if (m.keyCode === 8) {
                        m.rttSpecial = models_1.RttSpecialType.backspace;
                    }
                    else {
                        return;
                    }
                    m.data = String.fromCharCode(m.keyCode);
                    _this.io.sockets.connected[m.deviceId].emit(models_1.MessageType.rtt, m);
                    _this.io.sockets.connected[m.deviceId].emit(models_1.MessageType.rttspecial, m);
                }
                //socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ");
            });
            socket.on(models_1.MessageType.disconnect, function () {
                console.log((app || web) + " has left");
                if (connectionList[socket.id]) {
                    delete connectionList[socket.id];
                }
                if (_this.io) {
                    _this.io.emit(models_1.MessageType.connectionDetails, connectionList);
                }
                //socket.broadcast.emit( "userdisconnect" ,' user has left');
            });
        });
    };
    return Socket;
}());
exports.Socket = Socket;
