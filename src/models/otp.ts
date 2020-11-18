import { Document, Schema, Model, model, Mongoose } from "mongoose";

export const OTP_EXPIRY: number = 15; // Im Minutes

export interface IOtp {
  otp: number;
  userId: Schema.Types.ObjectId;
  createdAt?: Date;
}

export interface IOtpModel extends IOtp, Document {}

var OtpSchema: Schema = new Schema(
  {
    otp: Number,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: OTP_EXPIRY * 60
    }
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey :false
  }
);

export const OtpModel: Model<IOtpModel> = model<IOtpModel>("otps", OtpSchema);

export var findByOtpAndUserId = function(
  otp: number,
  userId: Schema.Types.ObjectId,
  cb: Function
) {
  OtpModel.findOne({ otp: otp, userId:userId }, function(err, otpObj) {
    cb(err, otpObj);
  });
};

export var findByOtpId = function(
  otpId: Schema.Types.ObjectId,
  cb: Function
) {
  OtpModel.findById(otpId, function(err, otpObj) {
    cb(err, otpObj);
  });
};

export var createOtp = function(otpObj: any, cb: Function) {
  OtpModel.insertMany([otpObj], function(err, result) {
    cb(err, result);
  });
};
