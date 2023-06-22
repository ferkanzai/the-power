import { NextFunction, Request, Response } from "express";
import { createCustomError, isEmptyBody } from "../utils";

export const checkBody = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (isEmptyBody(req.body)) {
      throw createCustomError("BadRequestError", "Body can not be empty!");
    }

    const { originalUrl } = req;

    if (
      originalUrl === "/auth/signin" &&
      (!req.body.accountNumber || !req.body.password)
    ) {
      throw createCustomError(
        "BadRequestError",
        "Account number and password are mandatory fields"
      );
    }

    if (
      originalUrl === "/auth/signup" &&
      (!req.body.age ||
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.initialBalance)
    ) {
      throw createCustomError(
        "BadRequestError",
        "Age, first name, last name and initial balance are mandatory fields"
      );
    }

    if (
      originalUrl === "/transactions/send" &&
      (!req.body.accountNumber || !req.body.amount)
    ) {
      throw createCustomError(
        "BadRequestError",
        "Account number and amount are mandatory fields"
      );
    }

    if (!req.body.accountNumber && !originalUrl.includes("auth")) {
      throw createCustomError(
        "BadRequestError",
        "Account number is a mandatory field"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
