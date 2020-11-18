import { Document, Schema, Model, model, Mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const saltRounds = 14;

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  BOT = "BOT"
}

export interface IUser {
  email: string;
  fullname: string;
  password: string;
  mobile: string;
  image: string;
  role: UserRole;
  isMobileVerified?: boolean;
  isDeleted?: boolean;
  isEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserModel extends IUser, Document {}

var UserSchema: Schema = new Schema(
  {
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
      default:"images/user.png"
    },
    role :{
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
  },
  {
    usePushEach: true,
    bufferCommands: false,
    versionKey :false
  }
);

export const UserModel: Model<IUserModel> = model<IUserModel>(
  "users",
  UserSchema
);

// Return a salted password the say way that is done for the database.
export var createSaltedPassword = function(
  password: string,
  callback: Function
) {
  bcrypt.genSalt(saltRounds, function(err, salt) {
    // @todo Need to handle error.
    bcrypt.hash(password, salt, function(err1, hash) {
      callback(err1, hash);
    });
  });
};

export var compareSaltedPassword = function(
  password: string,
  hash: string,
  callback: Function
) {
  bcrypt.compare(password, hash, function(err, isMatch) {
    callback(err, isMatch);
  });
};

export var findByEmail = function(email: string, cb: Function) {
  UserModel.findOne({ email: email }, function(err, user) {
    cb(err, user);
  });
};

export var findByEmailOrMobile = function(emailOrMobile: string, cb: Function) {
  UserModel.findOne(
    { $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }] },
    function(err, user) {
      cb(err, user);
    }
  );
};

export var findByUserId = function(
  userId: Schema.Types.ObjectId,
  includeDisablednDeleted: boolean,
  cb: Function
) {
  UserModel.findById(userId, function(err, user) {
    if (user && !includeDisablednDeleted) {
      if (user.isDeleted || !user.isEnabled) {
        cb(err, null);
        return;
      }
    }
    cb(err, user);
  });
};

export var createUser = function(userObj: any, cb: Function) {
  UserModel.insertMany([userObj], function(err, user) {
    cb(err, user);
  });
};

export var updateUserByEmail = function(
  email: string,
  userObj: any,
  cb: Function
) {
  UserModel.updateOne(
    { email: email },
    { $set: userObj },
    { upsert: true },
    function(err, user) {
      cb(err, user);
    }
  );
};
