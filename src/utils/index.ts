import { Document, Types } from "mongoose";
import { SanitizedUser, UserModel } from "../models/User";
import { ErrnoException } from "../types/app";

export const isEmptyBody = (body: Record<string, unknown>) => {
  return Object.keys(body).length === 0;
};

export const generateRandomAccountNumber = () => {
  return Math.floor(Math.random() * 10000000000);
};

export const generateRandomPassword = (length = 14) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
};

const errors = {
  NotFoundError: {
    code: 404,
    message: "Not found",
    name: "NotFoundError",
  },
  BadRequestError: {
    code: 400,
    message: "Bad request",
    name: "BadRequestError",
  },
  UnauthorizedError: {
    code: 401,
    message: "Unauthorized",
    name: "UnauthorizedError",
  },
};

type errorNames = keyof typeof errors;

export const createCustomError = (name: errorNames, message?: string) => {
  const error = {
    code: errors[name].code,
    message: message ?? errors[name].message,
    name: errors[name].name,
  };

  return error as ErrnoException;
};

export const sanitizeUser = (
  user: Document<unknown, {}, UserModel> &
    Omit<
      UserModel & {
        _id: Types.ObjectId;
      },
      never
    >
): SanitizedUser =>
  ({
    accountNumber: user.accountNumber,
    balance: user.balance,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
  } as const);

export const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
