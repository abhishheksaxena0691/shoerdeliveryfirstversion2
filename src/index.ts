import express = require("express");
import * as http from "http";
import path from "path";
import favicon from "serve-favicon";
import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import cookieParser from "cookie-parser";
import expressValidator from "express-validator";
import session from "express-session";
import mongoose = require("mongoose");
import passport from "passport";
import BearerStrategy from "passport-http-bearer";
import { Request, Response } from "express";
const app = express();
const server = http.createServer(app);
import { Config } from "./config/config";
import { Socket } from "./sockets/socket";
import { logger } from "./config/winston";
import { NextFunction } from "connect";
import HttpException from "./exceptions/HttpException";
import util from "util";
import { DB } from "./models/db";
import * as User from "./models/user";
import * as Token from "./models/token";
import { ResponseObj } from "./models/models";

let db = new DB();
export let config = new Config();
export let socket = new Socket(server);
const port: number = config.port || 4300;
const mongodbURI: string = config.mongodbURI;

app.set("port", port);
app.set("views", __dirname + "/../views");
app.set("view engine", "ejs");

app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));
//app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

logger.debug(app.get("views"));

// development only
if ("development" === app.get("env")) {
  app.use(errorhandler());
}
app.use(expressValidator());
app.use(passport.initialize());

app.use(
  session({
    secret: "keyboard shoe factory",
    resave: true,
    saveUninitialized: false
  })
);

// Bring in the database!
db.connectWithRetry(mongodbURI);

passport.use(
  new BearerStrategy.Strategy(function(token, done) {
    //logger.debug("Passport Token: " + token);
    Token.findByToken(token, function(err: Error, tokenFromDb: any) {
      if (err) {
        let responseObj = new ResponseObj(401, "Unauthorized", undefined);
        return done(err, false, responseObj.toJsonString());
      }
      if (!tokenFromDb) {
        let responseObj = new ResponseObj(401, "Unauthorized", undefined);
        return done(null, false, responseObj.toJsonString());
      }
      User.findByUserId(tokenFromDb.userId, false, function(
        err: Error,
        user: any
      ) {
        if (err) {
          let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
          return done(err, false, responseObj.toJsonString());
        }
        if (!user) {
          let responseObj = new ResponseObj(401, "Unauthorized!", undefined);
          return done(null, false, responseObj.toJsonString());
        }
        return done(null, user, { scope: "all", message: "Shoe Factory" });
      });
    });
  })
);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  next();
});

app.get(["/", "/login"], (req: Request, res: Response) => {
    res.render("login", {
      title: "Shoe Factory",
      relPath:"./"
    });
});

app.get("/otp", (req: Request, res: Response) => {
  res.render("otp", {
    title: "Shoe Factory",
    relPath:"./",
    otpId:req.query.otpId
  });
});

app.get("/403", (req: Request, res: Response) => {
  res.render("403", {
    title: "Shoe Factory",
    relPath:"./"
  });
});

let authRoute = require("./routes/authentication");
let userRoute = require("./routes/user");

// Routes
app.use("/auth", authRoute);
app.use("/", userRoute);

server.listen(port, () => {
  logger.debug("Shoe Factory app is running on port " + port);
});

app.use(function(req: any, res: Response, next: NextFunction) {
  // if there's a flash message in the session request, make it available in the response, then delete it

  if (req.session && req.session.sessionFlash) {
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
  }

  next();
});

//catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  let err: HttpException = new HttpException(404, "Not Found");
  next(err);
});

//error handlers
//development error handler
//will print stacktrace
if (app.get("env") === "development") {
  app.use(function(
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.status(err.status || 500);
    logger.debug("serving error page - " + err);
    //logger.debug(util.inspect(req, {showHidden: false}));
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

//production error handler
//no stacktraces leaked to user
app.use(function(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(err.status || 500);
  //  res.render('error', {
  //      message: err.message,
  //      error: {}
  //  });
});

process.on("SIGINT", function() {
  process.exit(0);
});

process.on("SIGTERM", function() {
  process.exit(0);
});

module.exports = app;

//logger.debug("Init complete.");
