import { Document, Schema, Model, model, Mongoose } from "mongoose";
import { logger } from "../config/winston";

export const BROCHURE_EXPIRY: number = 60 * 24 * 180; // Im Minutes

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID_ONLINE = "PAID ONLINE",
  PAID_BY_CASH = "PAID BY CASH"
}

export interface IBrochureReport {
  description: string;
  qty: string;
  amount: string;
}

var BrochureReportSchema: Schema = new Schema({
  description: String,
  qty: String,
  amount: String
});

export interface IBrochure {
  name: string;
  originalFilename: string;
  originalFilePath: string;
  path: string;
  userId: Schema.Types.ObjectId;
  username: string;
  amount: number;
  paymentStatus: PaymentStatus;
  transactionId: string;
  receiptId: string;
  brochureParsedTitle: string;
  brochureParsedSubTitle: string;
  brochureParsedCustomer: string;
  brochureParsedSeller: string;
  brochureParsedTransaction: string;
  brochureParsedDate: string;
  brochureParsedTime: string;
  brochureParsedTotal: string;
  reports: IBrochureReport[];
  coupon?: string;
  createdAt?: Date;
  brochureDate?: Date;
  paymentDate?: Date;
}

export interface IBrochureModel extends IBrochure, Document {}

var BrochureSchema: Schema = new Schema(
  {
    name: String,
    originalFilename: String,
    originalFilePath: String,
    path: String,
    userId: Schema.Types.ObjectId,
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
      expires: BROCHURE_EXPIRY * 60
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
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey: false
  }
);

export const BrochureModel: Model<IBrochureModel> = model<IBrochureModel>(
  "brochures",
  BrochureSchema
);

export var findAllByUserId = function(
  userId: Schema.Types.ObjectId,
  cb: Function
) {
  BrochureModel.find({ userId: userId }, function(err, user) {
    cb(err, user);
  }).sort({createdAt:-1});
};

export var findByBrochureName = function(filename: string, cb: Function) {
  BrochureModel.findOne({ name: filename }, function(err, user) {
    cb(err, user);
  });
};

export var findByDateRange = function(
  startDate: Date,
  endDate: Date,
  cb: Function
) {
  BrochureModel.find(
    { brochureDate: { $gte: startDate, $lt: endDate } },
    function(err, user) {
      cb(err, user);
    }
  );
};

export var findByBrochureId = function(
  brochureId: Schema.Types.ObjectId,
  cb: Function
) {
  BrochureModel.findById(brochureId, function(err, brochure) {
    cb(err, brochure);
  });
};

export var createBrochure = function(brochureObj: any, cb: Function) {
  BrochureModel.insertMany([brochureObj], function(err, brochure) {
    cb(err, brochure);
  });
};

export var updateBrochureById = function(
  brochureId: Schema.Types.ObjectId,
  brochureObj: any,
  cb: Function
) {
  BrochureModel.updateOne(
    { _id: brochureId },
    { $set: brochureObj },
    { upsert: true },
    function(err, user) {
      cb(err, user);
    }
  );
};
