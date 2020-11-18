import { Document, Schema, Model, model, Mongoose } from "mongoose";

export enum HelpStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

export interface IHelp {
  question: string;
  answer?: string;
  status: HelpStatus;
  userId: Schema.Types.ObjectId;
  createdAt?: Date;
}

export interface IHelpModel extends IHelp, Document {}

var HelpSchema: Schema = new Schema(
  {
    question: String,
    answer: {
      type: String,
      default: ""
    },
    status: {
      type: HelpStatus,
      default: HelpStatus.PENDING
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey :false
  }
);

export const HelpModel: Model<IHelpModel> = model<IHelpModel>(
  "helps",
  HelpSchema
);

export var findByQuestionAndUserId = function(
  question: string,
  userId: Schema.Types.ObjectId,
  cb: Function
) {
  HelpModel.findOne({ question: question, userId: userId }, function(
    err,
    helpObj
  ) {
    cb(err, helpObj);
  });
};

export var findByHelpId = function(
  helpId: Schema.Types.ObjectId,
  cb: Function
) {
  HelpModel.findById(helpId, function(err, helpObj) {
    cb(err, helpObj);
  });
};

export var findAllByUserId = function(
  userId: Schema.Types.ObjectId,
  cb: Function
) {
  HelpModel.find({ userId: userId }, function(err, helpObj) {
    cb(err, helpObj);
  });
};

export var createHelp = function(helpObj: any, cb: Function) {
  HelpModel.insertMany([helpObj], function(err, result) {
    cb(err, result);
  });
};
