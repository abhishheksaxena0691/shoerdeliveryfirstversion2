"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var saltRounds = 14;
var AgentSchema = new mongoose_1.Schema({
    email: {
        type: String,
        lowercase: true,
        index: true,
        unique: true
    },
    firstName: String,
    lastName: String,
    password: String,
    resourceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "resources"
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
    bufferCommands: false
});
exports.AgentModel = mongoose_1.model("agents", AgentSchema);
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
    exports.AgentModel.findOne({ email: email }, function (err, agent) {
        cb(err, agent);
    });
};
exports.findByAgentId = function (agentId, includeDisablednDeleted, cb) {
    exports.AgentModel.findById(agentId, function (err, agent) {
        if (agent && !includeDisablednDeleted) {
            if (agent.isDeleted || !agent.isEnabled) {
                cb(err, null);
                return;
            }
        }
        cb(err, agent);
    });
};
exports.createAgent = function (agentObj, cb) {
    exports.AgentModel.insertMany([agentObj], function (err, agent) {
        cb(err, agent);
    });
};
exports.updateAgentByEmail = function (email, agentObj, cb) {
    exports.AgentModel.updateOne({ email: email }, { $set: agentObj }, { upsert: true }, function (err, agent) {
        cb(err, agent);
    });
};
