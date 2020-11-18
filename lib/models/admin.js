"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var AdminSchema = new mongoose_1.Schema({
    email: {
        type: String,
        lowercase: true,
        index: true,
        unique: true
    },
    firstName: String,
    lastName: String,
    password: String,
    isEnabled: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    token: String,
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
    bufferCommands: false
});
exports.Admin = mongoose_1.model("admins", AdminSchema);
