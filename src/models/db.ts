import mongoose = require("mongoose");
import { logger } from "../config/winston";

export class DB {
  // Mongoose won't retry an initial failed connection.
  private static db:any;
  public getDB() {
    return DB.db;
  }
  public connectWithRetry(uri: string) {
    return mongoose.connect(
      uri,
      {
        bufferMaxEntries: 0,
        useCreateIndex: true,
        useNewUrlParser: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
      },
      function(err: Error) {
        if (err) {
          logger.error(
            "Mongoose failed initial connection. Retrying in 5 seconds..."
          );
          setTimeout(function() {
            module.exports.connectWithRetry(uri);
          }, 5000);
        } else {
          mongoose.Promise = global.Promise;
          DB.db = mongoose.connection;
        }
      }
    );
  }

  public connectionClose(callback: Function) {
    mongoose.connection.close(function() {
      logger.debug("Mongoose connection closed.");

      if (callback) {
        callback();
      }
    });
  }
}

mongoose.connection.on("error", function(err) {
  logger.error("Mongoose error: " + err);
});

mongoose.connection.on("connected", function() {
  logger.debug("Mongoose connected.");
});

mongoose.connection.on("disconnected", function() {
  logger.debug("Mongoose disconnected.");
});
