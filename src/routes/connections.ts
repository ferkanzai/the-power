import { Router } from "express";
import { isAlreadyConnection } from "../middlewares/connections";
import { checkBody } from "../middlewares/utils";
import User, { UserRequestWithAccountNumber } from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError } from "../utils";

const router = Router();

router.get("/all", async (req: RequestWithAccountNumber, res, next) => {
  try {
    const { accountNumber } = req;

    const result = await User.findOne({ accountNumber }).populate(
      "connections",
      "-_id age firstName lastName accountNumber",
      "User"
    );

    if (!result) {
      throw createCustomError("NotFoundError");
    }

    res.status(200).json({
      success: true,
      data: { connections: result.connections },
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/add",
  checkBody,
  isAlreadyConnection,
  async (req: RequestWithAccountNumber, res, next) => {
    try {
      const { accountNumber: accountNumberToAdd } = req.body;
      const { accountNumber } = req;

      if (!accountNumberToAdd) {
        throw createCustomError(
          "BadRequestError",
          "Account number to add is a mandatory field"
        );
      }

      if (Number(accountNumber) === Number(accountNumberToAdd)) {
        throw createCustomError(
          "ForbiddenError",
          "You can not add yourself as a connection"
        );
      }

      const documentToAdd = await User.findOne(
        {
          accountNumber: accountNumberToAdd,
        },
        { _id: 1 }
      );

      const result = await User.findOneAndUpdate(
        { accountNumber },
        {
          $addToSet: {
            requests: documentToAdd?._id,
          },
        },
        { new: true }
      ).populate(
        "requests",
        "-_id age firstName lastName accountNumber",
        "User"
      );

      if (!result || !documentToAdd) {
        throw createCustomError("NotFoundError");
      }

      res.status(200).json({
        success: true,
        data: {
          requests: result.requests,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/accept",
  checkBody,
  isAlreadyConnection,
  async (req: RequestWithAccountNumber, res, next) => {
    try {
      const { accountNumber: accountNumberToAccept } = req.body;
      const { accountNumber } = req;

      if (!accountNumberToAccept) {
        throw createCustomError(
          "BadRequestError",
          "Account number to accept is a mandatory field"
        );
      }

      if (Number(accountNumber) === Number(accountNumberToAccept)) {
        throw createCustomError(
          "ForbiddenError",
          "You can not accept yourself as a connection"
        );
      }

      const accountToAddId = await User.findOne(
        { accountNumber: accountNumberToAccept },
        { _id: 1 }
      );

      const requests: { requests: UserRequestWithAccountNumber[] } | null =
        await User.findOne(
          { accountNumber, requests: { $in: [accountToAddId?._id] } },
          { requests: 1, _id: 0 }
        ).populate("requests", "accountNumber -_id", "User", {
          accountNumber: accountNumberToAccept,
        });

      if (!requests) {
        throw createCustomError(
          "NotFoundError",
          "No requests with this account number"
        );
      }

      const data = await User.findOneAndUpdate(
        { accountNumber },
        {
          $addToSet: {
            connections: accountToAddId?._id,
          },
          $pull: {
            requests: accountToAddId?._id,
          },
        },
        { new: true }
      ).populate(
        "connections",
        "-_id age firstName lastName accountNumber",
        "User"
      );

      console.log(data);

      res
        .status(200)
        .json({ success: true, data: { connections: data?.connections } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
