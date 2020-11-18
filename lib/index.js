"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = __importStar(require("http"));
var path_1 = __importDefault(require("path"));
var serve_favicon_1 = __importDefault(require("serve-favicon"));
var body_parser_1 = __importDefault(require("body-parser"));
var errorhandler_1 = __importDefault(require("errorhandler"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var express_validator_1 = __importDefault(require("express-validator"));
var express_session_1 = __importDefault(require("express-session"));
var passport_1 = __importDefault(require("passport"));
var passport_http_bearer_1 = __importDefault(require("passport-http-bearer"));
var app = express();
var server = http.createServer(app);
var config_1 = require("./config/config");
var socket_1 = require("./sockets/socket");
var winston_1 = require("./config/winston");
var HttpException_1 = __importDefault(require("./exceptions/HttpException"));
var db_1 = require("./models/db");
var User = __importStar(require("./models/user"));
var Token = __importStar(require("./models/token"));
var models_1 = require("./models/models");
var db = new db_1.DB();
exports.config = new config_1.Config();
exports.socket = new socket_1.Socket(server);
var port = exports.config.port || 4300;
var mongodbURI = exports.config.mongodbURI;
app.set("port", port);
app.set("views", __dirname + "/../views");
app.set("view engine", "ejs");
app.use(serve_favicon_1.default(path_1.default.join(__dirname, "../public", "favicon.ico")));
//app.use(logger('dev'));
app.use(cookie_parser_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express.static(path_1.default.join(__dirname, "../public")));
winston_1.logger.debug(app.get("views"));
// development only
if ("development" === app.get("env")) {
    app.use(errorhandler_1.default());
}
app.use(express_validator_1.default());
app.use(passport_1.default.initialize());
app.use(express_session_1.default({
    secret: "keyboard shoe factory",
    resave: true,
    saveUninitialized: false
}));
// Bring in the database!
db.connectWithRetry(mongodbURI);
passport_1.default.use(new passport_http_bearer_1.default.Strategy(function (token, done) {
    //logger.debug("Passport Token: " + token);
    Token.findByToken(token, function (err, tokenFromDb) {
        if (err) {
            var responseObj = new models_1.ResponseObj(401, "Unauthorized", undefined);
            return done(err, false, responseObj.toJsonString());
        }
        if (!tokenFromDb) {
            var responseObj = new models_1.ResponseObj(401, "Unauthorized", undefined);
            return done(null, false, responseObj.toJsonString());
        }
        User.findByUserId(tokenFromDb.userId, false, function (err, user) {
            if (err) {
                var responseObj = new models_1.ResponseObj(401, "Unauthorized!", undefined);
                return done(err, false, responseObj.toJsonString());
            }
            if (!user) {
                var responseObj = new models_1.ResponseObj(401, "Unauthorized!", undefined);
                return done(null, false, responseObj.toJsonString());
            }
            return done(null, user, { scope: "all", message: "Shoe Factory" });
        });
    });
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
    next();
});
app.get(["/", "/login"], function (req, res) {
    res.render("login", {
        title: "Shoe Factory",
        relPath: "./"
    });
});
app.get("/otp", function (req, res) {
    res.render("otp", {
        title: "Shoe Factory",
        relPath: "./",
        otpId: req.query.otpId
    });
});
app.get("/403", function (req, res) {
    res.render("403", {
        title: "Shoe Factory",
        relPath: "./"
    });
});
var authRoute = require("./routes/authentication");
var userRoute = require("./routes/user");
// Routes
app.use("/auth", authRoute);
app.use("/", userRoute);
server.listen(port, function () {
    winston_1.logger.debug("Shoe Factory app is running on port " + port);
});
app.use(function (req, res, next) {
    // if there's a flash message in the session request, make it available in the response, then delete it
    if (req.session && req.session.sessionFlash) {
        res.locals.sessionFlash = req.session.sessionFlash;
        delete req.session.sessionFlash;
    }
    next();
});
//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new HttpException_1.default(404, "Not Found");
    next(err);
});
//error handlers
//development error handler
//will print stacktrace
if (app.get("env") === "development") {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        winston_1.logger.debug("serving error page - " + err);
        //logger.debug(util.inspect(req, {showHidden: false}));
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}
//production error handler
//no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    //  res.render('error', {
    //      message: err.message,
    //      error: {}
    //  });
});
process.on("SIGINT", function () {
    process.exit(0);
});
process.on("SIGTERM", function () {
    process.exit(0);
});
module.exports = app;
//logger.debug("Init complete.");
