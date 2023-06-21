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

    const result = await User.findOne({ accountNumber }, { connections: 1 });
    const resultToAdd = await User.findOne(
      { accountNumber: accountNumberToAdd },
      { _id: 1 }
    );

    if (!result || !resultToAdd) {
      throw createCustomError("NotFoundError", "User or connection not found");
    }

    if (
      result.connections
        .map((con) => con.toString())
        .includes(resultToAdd._id.toString())
    ) {
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
