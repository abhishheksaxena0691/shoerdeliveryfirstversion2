"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var models_1 = require("../models/models");
var winston_1 = require("../config/winston");
var connectionList = {};
var Socket = /** @class */ (function () {
    function Socket(server) {
        this.init(server);
    }
    Socket.prototype.init = function (server) {
        var _this = this;
        this.io = socket_io_1.default.listen(server);
        this.io.on("connection", function (socket) {
            var user;
            var bot;
            winston_1.logger.silly("user connected");
            if (_this.io) {
                _this.io.emit(models_1.MessageType.USER_IDENTIFICATION, { data: "111111" });
            }
            connectionList[socket.id] = {};
            socket.on(models_1.MessageType.USER_IDENTIFICATION, function (m) {
                user = m.data;
                connectionList[socket.id].user = user;
                winston_1.logger.silly(m.data + " : has joined as user");
            });
            // socket.on(MessageType.BOT_IDENTIFICATION, (m: Message) => {
            //   bot = m.data;
            //   connectionList[socket.id].bot = bot;
            //   logger.silly(m.data + " : has joined as bot");
            // });
            // socket.on(MessageType.FILES_DETECTED, (m: Message) => {
            //   if (bot) {
            //     const files = m.files;
            //     for (let file in files){
            //       if (file.length > 4 && file.indexOf('.') != -1) {
            //       }
            //     }
            //     User.brochureToUserIdMap;
            //     logger.silly(m.data + " : has joined as bot");
            //   } else {
            //     logger.error("A non bot("+user||bot+") is trying to send files: " + m.data);
            //   }
            // });
            socket.on(models_1.MessageType.DISCONNECT, function () {
                winston_1.logger.silly((bot || user) + " has left");
                if (connectionList[socket.id]) {
                    delete connectionList[socket.id];
                }
            });
        });
    };
    /**
     * brochureReady
     */
    Socket.prototype.brochureReady = function (userId, brochureName, brochurePath) {
        if (this.io) {
            this.io.emit(models_1.MessageType.BROCHURE_READY + "_" + userId, {
                data: { filename: brochureName, path: brochurePath }
            });
        }
    };
    return Socket;
}());
exports.Socket = Socket;
