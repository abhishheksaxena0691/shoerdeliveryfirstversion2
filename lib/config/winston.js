"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var DailyRotateFile = require("winston-daily-rotate-file");
var options = {
    format: winston_1.format.combine(winston_1.format.label({ label: "[Shoe Factory]" }), winston_1.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS"
    }), winston_1.format.simple()),
    transports: [
        new DailyRotateFile({
            filename: "logs/info.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "5m",
            maxFiles: "14d",
            level: "info" // info and below to rotate
        }),
        new DailyRotateFile({
            filename: "logs/error.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "5m",
            maxFiles: "14d",
            level: "error" // error and below to rotate
        }),
        new DailyRotateFile({
            filename: "logs/silly.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "5m",
            maxFiles: "1d",
            level: "silly" // error and below to rotate
        }),
        new winston_1.transports.Console({
            level: "silly"
        })
    ],
    file: "",
    console: ""
};
var logger = winston_1.createLogger(options);
exports.logger = logger;
logger.debug("Debugging info");
