"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.BROCHURE_EXPIRY = 60 * 24 * 180; // Im Minutes
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID_ONLINE"] = "PAID ONLINE";
    PaymentStatus["PAID_BY_CASH"] = "PAID BY CASH";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
var BrochureReportSchema = new mongoose_1.Schema({
    description: String,
    qty: String,
    amount: String
});
var BrochureSchema = new mongoose_1.Schema({
    name: String,
    originalFilename: String,
    originalFilePath: String,
    path: String,
    userId: mongoose_1.Schema.Types.ObjectId,
    username: {
        type: String,
        default: "Unknown"
    },
    amount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: exports.BROCHURE_EXPIRY * 60
    },
    paymentStatus: {
        type: PaymentStatus,
        default: PaymentStatus.PENDING
    },
    transactionId: {
        type: String,
        default: "-"
    },
    receiptId: {
        type: String,
        default: "-"
    },
    coupon: String,
    brochureParsedTitle: String,
    brochureParsedSubTitle: String,
    brochureParsedCustomer: String,
    brochureParsedSeller: String,
    brochureParsedTransaction: String,
    brochureParsedDate: String,
    brochureParsedTime: String,
    brochureParsedTotal: String,
    reports: {
        type: [BrochureReportSchema],
        default: []
    },
    brochureDate: {
        type: Date,
        default: Date.now
    },
    paymentDate: Date
}, {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
});
exports.BrochureModel = mongoose_1.model("brochures", BrochureSchema);
exports.findAllByUserId = function (userId, cb) {
    exports.BrochureModel.find({ userId: userId }, function (err, user) {
        cb(err, user);
    }).sort({ createdAt: -1 });
};
exports.findByBrochureName = function (filename, cb) {
    exports.BrochureModel.findOne({ name: filename }, function (err, user) {
        cb(err, user);
    });
};
exports.findByDateRange = function (startDate, endDate, cb) {
    exports.BrochureModel.find({ brochureDate: { $gte: startDate, $lt: endDate } }, function (err, user) {
        cb(err, user);
    });
};
exports.findByBrochureId = function (brochureId, cb) {
    exports.BrochureModel.findById(brochureId, function (err, brochure) {
        cb(err, brochure);
    });
};
exports.createBrochure = function (brochureObj, cb) {
    exports.BrochureModel.insertMany([brochureObj], function (err, brochure) {
        cb(err, brochure);
    });
};
exports.updateBrochureById = function (brochureId, brochureObj, cb) {
    exports.BrochureModel.updateOne({ _id: brochureId }, { $set: brochureObj }, { upsert: true }, function (err, user) {
        cb(err, user);
    });
};
