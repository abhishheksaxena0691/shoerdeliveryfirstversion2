import { createLogger, format, transports, LoggerOptions } from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

const options = {
  format: format.combine(
    format.label({ label: "[Shoe Factory]" }),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS"
    }),
    format.simple()
  ),
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
    new transports.Console({
      level: "silly"
    })
  ],
  file: "",
  console: ""
};

let logger = createLogger(options);

logger.debug("Debugging info");
export { logger };
