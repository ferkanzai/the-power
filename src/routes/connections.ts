import { Router } from "express";
import { isConnection, isMyConnection } from "../middlewares/connections";
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
  isMyConnection,
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

      const documentToAdd = await User.findOne({ accountNumber }, { _id: 1 });

      const result = await User.findOneAndUpdate(
        { accountNumber: accountNumberToAdd },
        {
          $addToSet: {
            requests: documentToAdd?._id,
          },
        }
      );

      if (!result || !documentToAdd) {
        throw createCustomError("NotFoundError");
      }

      res.status(204).json({});
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/accept",
  checkBody,
  isConnection,
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

      const accountToAddId = await User.findOne(
        { accountNumber: accountNumberToAccept },
        { _id: 1 }
      );

      const data = await User.findOneAndUpdate(
        { accountNumber, requests: { $in: [accountToAddId?._id] } },
        {
          $addToSet: {
            connections: accountToAddId?._id,
          },
          $pull: {
            requests: accountToAddId?._id,
          },
        }
      );

      if (!data) {
        throw createCustomError(
          "NotFoundError",
          "No requests with this account number"
        );
      }

      res.status(204).json({});
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/delete",
  checkBody,
  isConnection,
  async (req: RequestWithAccountNumber, res, next) => {
    try {
      const { accountNumber: accountNumberToDelete } = req.body;
      const { accountNumber } = req;

      if (!accountNumberToDelete) {
        throw createCustomError(
          "BadRequestError",
          "Account number to delete is a mandatory field"
        );
      }

      const accountToDeleteId = await User.findOne(
        { accountNumber: accountNumberToDelete },
        { _id: 1 }
      );

      await User.findOneAndUpdate(
        { accountNumber },
        {
          $pull: {
            connections: accountToDeleteId?._id,
          },
        }
      );

      res.status(204).json({});
    } catch (error) {
      next(error);
    }
  }
);

export default router;
