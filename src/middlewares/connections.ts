import { NextFunction, Response } from "express";
import User, { AccountNumberWithConnections } from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { accountInConnections, createCustomError } from "../utils";

export const isSameAccount = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    if (Number(accountNumber) === Number(accountNumberToInteractWith)) {
      throw createCustomError("ForbiddenError", "This is your account number");
    }

    next();
  } catch (error) {
    next(error);
  }
};

// this checks if the user sending the request has his account number in the connections array of the user he wants to interact with
export const isMyConnection = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber, originalUrl } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    const resultToAdd = await User.findOne({ accountNumber }, { _id: 1 });

    if (!resultToAdd) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const result = await User.findOne(
      {
        accountNumber: accountNumberToInteractWith,
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

// this checks if the user accepting the request has the account number in his connections array
// also, when deleting checks if the user trying to delete a connection has that account number in his connections array
export const isConnection = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber, originalUrl } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

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

export const isTwoWayConnection = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    const user: AccountNumberWithConnections | null = await User.findOne(
      { accountNumber },
      { connections: 1, accountNumber: 1 }
    ).populate("connections", "-_id accountNumber", "User");

    const userToInteractWith: AccountNumberWithConnections | null =
      await User.findOne(
        { accountNumber: accountNumberToInteractWith },
        { connections: 1, accountNumber: 1 }
      ).populate("connections", "-_id accountNumber", "User");

    if (!user || !userToInteractWith) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const userConnections = user.connections.map(
      (connection) => connection.accountNumber
    );

    const userToInteractWithConnections = userToInteractWith.connections.map(
      (connection) => connection.accountNumber
    );

    if (
      !(
        accountInConnections(
          user.accountNumber,
          userToInteractWithConnections
        ) &&
        accountInConnections(userToInteractWith.accountNumber, userConnections)
      )
    ) {
      throw createCustomError(
        "ForbiddenError",
        "Both users must be connected to each other to perform this action"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
