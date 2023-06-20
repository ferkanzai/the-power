import { NextFunction, Request, Response } from "express";
import { errors, jwtVerify } from "jose";
import { createCustomError, secret } from "../utils";

export const isAuthenticated = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createCustomError("UnauthorizedError");
    }

    await jwtVerify(token, secret, {
      issuer: "fercarmona.dev",
      maxTokenAge: "15m",
    });

    next();
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      next(createCustomError("UnauthorizedError", "Token expired"));
    }

    next(error);
  }
};
