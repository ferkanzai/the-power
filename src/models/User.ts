import { Schema, model } from "mongoose";

export interface User {
  balance: number;
  accountNumber: number;
  firstName: string;
  initialBalance: number;
  lastName: string;
  password: string;
}

export interface UserModel extends User, Document {}

export const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  initialBalance: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: function (this: UserModel) {
      return this.initialBalance;
    },
  },
});

UserSchema.pre("findOne", function (next) {
  this.select("-__v -_id");
  next();
});

export default model<UserModel>("User", UserSchema);
