"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var winston_1 = require("../config/winston");
var DB = /** @class */ (function () {
    function DB() {
    }
    DB.prototype.getDB = function () {
        return DB.db;
    };
    DB.prototype.connectWithRetry = function (uri) {
        return mongoose.connect(uri, {
            bufferMaxEntries: 0,
            useCreateIndex: true,
            useNewUrlParser: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000
        }, function (err) {
            if (err) {
                winston_1.logger.error("Mongoose failed initial connection. Retrying in 5 seconds...");
                setTimeout(function () {
                    module.exports.connectWithRetry(uri);
                }, 5000);
            }
            else {
                mongoose.Promise = global.Promise;
                DB.db = mongoose.connection;
            }
        });
    };
    DB.prototype.connectionClose = function (callback) {
        mongoose.connection.close(function () {
            winston_1.logger.debug("Mongoose connection closed.");
            if (callback) {
                callback();
            }
        });
    };
    return DB;
}());
exports.DB = DB;
mongoose.connection.on("error", function (err) {
    winston_1.logger.error("Mongoose error: " + err);
});
mongoose.connection.on("connected", function () {
    winston_1.logger.debug("Mongoose connected.");
});
mongoose.connection.on("disconnected", function () {
    winston_1.logger.debug("Mongoose disconnected.");
});
