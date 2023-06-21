import { NextFunction, Response } from "express";
import { RequestWithAccountNumber } from "../types/app";
import User from "../models/User";
import { calculateCommission, createCustomError } from "../utils";

export const canMakeTransaction = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { amount } = req.body;

    const user = await User.findOne({ accountNumber }, { balance: 1 });

    if (!user) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const balance = user.balance;
    const commision = calculateCommission(amount);

    if (balance + commision < amount) {
      throw createCustomError(
        "ForbiddenError",
        `You don't have enough money to make this transaction. Your balance is ${balance.toFixed(2)}`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
