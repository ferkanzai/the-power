import { Router } from "express";
import { isAlreadyConnection } from "../middlewares/connections";
import { checkBody } from "../middlewares/utils";
import User from "../models/User";
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
      const { accountNumberToAdd } = req.body;
      const { accountNumber } = req;

      if (!req.body.accountNumberToAdd) {
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
            connectionsRequests: documentToAdd?._id,
          },
        },
        { new: true }
      ).populate(
        "connectionsRequests",
        "-_id age firstName lastName accountNumber",
        "User"
      );

      if (!result || !documentToAdd) {
        throw createCustomError("NotFoundError");
      }

      res.status(200).json({
        success: true,
        data: {
          requests: result.connectionsRequests,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
