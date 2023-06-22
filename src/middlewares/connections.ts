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

// checks if the account number to interact with is in the logged in user's request array
export const isRequest = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    const accountToInteractWith = await User.findOne(
      { accountNumber: accountNumberToInteractWith },
      { _id: 1 }
    );

    if (!accountToInteractWith) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const requests = await User.findOne(
      {
        accountNumber,
        requests: { $in: [accountToInteractWith._id] },
      },
      { requests: 1 }
    );

    if (!requests) {
      throw createCustomError(
        "NotFoundError",
        "No requests with this account number"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// checks if the logged in user account is in the connections array of the account to interact with
// this is necessary to check if the logged in user has already accepted the request or not
export const isConnectionAlready = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    const account = await User.findOne({ accountNumber }, { _id: 1 });
    const accountToInteractWith = await User.findOne(
      { accountNumber: accountNumberToInteractWith },
      { _id: 1 }
    );

    if (!accountToInteractWith) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const result = await User.findOne(
      {
        accountNumber: accountNumberToInteractWith,
        connections: {
          $in: [account?._id],
        },
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

// checks if in the logged in user connections array there is the account number to interact with
// this serves two purposes:
// 1. checks if the users are connected, to avoid creating a new request
// 2. when deleting a connection, checks if the users are connected. If not, nothing to delete
export const isUserInConnections = async (
  req: RequestWithAccountNumber,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { accountNumber, originalUrl } = req;
    const { accountNumber: accountNumberToInteractWith } = req.body;

    const userToInteractWith = await User.findOne(
      { accountNumber: accountNumberToInteractWith },
      { _id: 1 }
    );

    if (!userToInteractWith) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const user = await User.findOne(
      {
        accountNumber,
        connections: {
          $in: [userToInteractWith._id],
        },
      },
      { connections: 1, _id: 1 }
    );

    if (user) {
      if (originalUrl === "/connections/delete") {
        return next();
      }

      throw createCustomError(
        "ForbiddenError",
        "You are already connected with this user"
      );
    }

    if (!user && originalUrl === "/connections/delete") {
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
