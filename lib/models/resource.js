"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ResourceSchema = new mongoose_1.Schema({
    authorizationUser: {
        type: String,
        index: true,
        unique: true
    },
    displayName: String,
    password: String,
    uri: String,
    serverIp: String,
    serverPort: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    usePushEach: true,
    bufferCommands: false
});
exports.ResourceModel = mongoose_1.model("resources", ResourceSchema);
exports.findByAuthorizationUser = function (authorizationUser, cb) {
    exports.ResourceModel.findOne({ authorizationUser: authorizationUser }, function (err, resource) {
        cb(err, resource);
    });
};
exports.createResource = function (resourceObj, cb) {
    exports.ResourceModel.insertMany([resourceObj], function (err, resource) {
        cb(err, resource);
    });
};
exports.updateResourceByAuthorizationUser = function (authorizationUser, resourceObj, cb) {
    exports.ResourceModel.updateOne({ authorizationUser: authorizationUser }, { $set: resourceObj }, { upsert: true }, function (err, resource) {
        cb(err, resource);
    });
};
