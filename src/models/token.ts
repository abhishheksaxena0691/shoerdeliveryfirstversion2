import { Document, Schema, Model, model } from "mongoose";

export const TOKEN_EXPIRY: number = 30; // Im Minutes

export interface IToken {
  token: string;
  userId: Schema.Types.ObjectId;
  createdAt?: Date;
}

export interface ITokenModel extends IToken, Document {}

var TokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      index: true,
      unique: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true
      //unique: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: TOKEN_EXPIRY * 60
    }
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey :false
  }
);

export const TokenModel: Model<ITokenModel> = model<ITokenModel>(
  "tokens",
  TokenSchema
);

export let updateToken = function(
  token: string,
  userId: string,
  cb: Function
) {
  let tokenObj = new TokenModel({ token: token, userId: userId });
  tokenObj.save(function(err, result) {
    cb(err, result);
  });
};

export let findByToken = function(token: string, cb: Function) {
  TokenModel.findOne({ token: token }, function(err, result) {
    cb(err, result);
  });
};
