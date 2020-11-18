"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var saltRounds = 14;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["BOT"] = "BOT";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        lowercase: true,
        index: true,
        unique: true
    },
    fullname: String,
    password: String,
    mobile: String,
    image: {
        type: String,
        default: "images/user.png"
    },
    role: {
        type: UserRole,
        default: UserRole.USER
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    lastLoginTime: {
        type: Date
    }
}, {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
});
exports.UserModel = mongoose_1.model("users", UserSchema);
// Return a salted password the say way that is done for the database.
exports.createSaltedPassword = function (password, callback) {
    bcryptjs_1.default.genSalt(saltRounds, function (err, salt) {
        // @todo Need to handle error.
        bcryptjs_1.default.hash(password, salt, function (err1, hash) {
            callback(err1, hash);
        });
    });
};
exports.compareSaltedPassword = function (password, hash, callback) {
    bcryptjs_1.default.compare(password, hash, function (err, isMatch) {
        callback(err, isMatch);
    });
};
exports.findByEmail = function (email, cb) {
    exports.UserModel.findOne({ email: email }, function (err, user) {
        cb(err, user);
    });
};
exports.findByEmailOrMobile = function (emailOrMobile, cb) {
    exports.UserModel.findOne({ $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] }, function (err, user) {
        cb(err, user);
    });
};
exports.findByUserId = function (userId, includeDisablednDeleted, cb) {
    exports.UserModel.findById(userId, function (err, user) {
        if (user && !includeDisablednDeleted) {
            if (user.isDeleted || !user.isEnabled) {
                cb(err, null);
                return;
            }
        }
        cb(err, user);
    });
};
exports.createUser = function (userObj, cb) {
    exports.UserModel.insertMany([userObj], function (err, user) {
        cb(err, user);
    });
};
exports.updateUserByEmail = function (email, userObj, cb) {
    exports.UserModel.updateOne({ email: email }, { $set: userObj }, { upsert: true }, function (err, user) {
        cb(err, user);
    });
};
