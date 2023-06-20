import { Schema, model } from "mongoose";

export interface User extends UserSignup {
  balance: number;
}

export type UserSignup = {
  accountNumber: number;
  firstName: string;
  initialBalance: number; 
  lastName: string;
  password: string;
}

const UserSchema = new Schema<User>({
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
    default: function (this: User) {
      return this.initialBalance;
    }
  }
});

export const User = model("User", UserSchema);