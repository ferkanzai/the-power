import { NextFunction, Response } from "express";
import User from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError } from "../utils";

export const isAlreadyConnection = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { accountNumber: accountNumberToAdd } = req.body;

    const resultToAdd = await User.findOne(
      { accountNumber: accountNumberToAdd },
      { _id: 1 }
    );

    if (!resultToAdd) {
      throw createCustomError(
        "NotFoundError",
        "Connection request account not found"
      );
    }

    const result = await User.findOne(
      {
        accountNumber,
        connections: { $in: [resultToAdd._id] },
      },
      { connections: 1 }
    );

    if (result) {
      throw createCustomError(
        "ForbiddenError",
        "You are already connected with this user"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
