import { NextFunction, Response } from "express";
import User from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError } from "../utils";

export const isConnection = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber, originalUrl } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    if (Number(accountNumber) === Number(accountNumberToInteractWith)) {
      throw createCustomError(
        "ForbiddenError",
        "This is your account number"
      );
    }

    const resultToAdd = await User.findOne(
      { accountNumber: accountNumberToInteractWith },
      { _id: 1 }
    );

    if (!resultToAdd) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const result = await User.findOne(
      {
        accountNumber,
        connections: { $in: [resultToAdd._id] },
      },
      { connections: 1 }
    );

    if (result) {
      if (originalUrl === "/connections/delete") {
        return next();
      }

      throw createCustomError(
        "ForbiddenError",
        "You are already connected with this user"
      );
    }

    if (originalUrl === "/connections/delete" && !result) {
      throw createCustomError(
        "ForbiddenError",
        "You are not connected with this user"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
