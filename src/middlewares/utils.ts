import { NextFunction, Request, Response } from "express";
import { createCustomError, isEmptyBody } from "../utils";

export const checkBody = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (isEmptyBody(req.body)) {
      throw createCustomError("BadRequestError", "Body can not be empty!");
    }

    next();
  } catch (error) {
    next(error);
  }
};
