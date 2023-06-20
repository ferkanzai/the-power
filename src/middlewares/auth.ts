import type { NextFunction, Request, Response } from "express";
import { errors, jwtVerify } from "jose";
import { type PayloadWithUser } from "../models/User";
import { createCustomError, secret } from "../utils";
import { RequestWithAccountNumber } from "../types/app";

export const isAuthenticated = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createCustomError("UnauthorizedError", "Token is required");
    }

    const { payload } = await jwtVerify(token, secret, {
      issuer: "fercarmona.dev",
      maxTokenAge: "15m",
    });

    const { user } = payload as PayloadWithUser;

    req.accountNumber = user.accountNumber;

    next();
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      next(createCustomError("UnauthorizedError", "Token expired"));
    }

    next(error);
  }
};

export const isAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    const { payload } = await jwtVerify(token as string, secret, {
      issuer: "fercarmona.dev",
      maxTokenAge: "15m",
    });

    const { user } = payload as PayloadWithUser;

    if (!user.roles?.includes("admin")) {
      throw createCustomError("UnauthorizedError", "Admin role required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
