import { JWTPayload } from "jose";
import { Schema, model } from "mongoose";

export interface User {
  accountNumber: number;
  age: number;
  balance: number;
  connections: Schema.Types.ObjectId[];
  connectionsRequests: Schema.Types.ObjectId[];
  firstName: string;
  initialBalance: number;
  lastName: string;
  password: string;
  roles: Roles[];
}

type Roles = "admin" | "user";

export type SanitizedUser = Omit<
  User,
  "password" | "initialBalance" | "connections" | "connectionsRequests"
>;

export type UserConnections = Pick<User, "connections">;

export interface UserModel extends User, Document {}

export type PayloadWithUser = JWTPayload & { user: SanitizedUser };

export const UserSchema = new Schema<UserModel>({
  age: {
    type: Number,
    required: true,
  },
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
  roles: {
    type: Schema.Types.Mixed,
    of: String,
    enum: ["admin", "user"] as Roles[],
    default: ["user"],
  },
  connections: {
    type: Schema.Types.Mixed,
    of: Schema.Types.ObjectId,
    ref: "User",
    default: [],
  },
  connectionsRequests: {
    type: Schema.Types.Mixed,
    of: Schema.Types.ObjectId,
    ref: "User",
    default: [],
  },
});

UserSchema.pre("findOne", function (next) {
  this.select("-__v -_id");
  next();
});

export default model<UserModel>("User", UserSchema);
