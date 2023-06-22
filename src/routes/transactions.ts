import { Router } from "express";
import { transactionsQueue } from "../config/queue";
import { isAdmin } from "../middlewares/auth";
import { isTwoWayConnection } from "../middlewares/connections";
import { canMakeTransaction } from "../middlewares/transactions";
import { checkBody } from "../middlewares/utils";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError } from "../utils";
import { connect, connection } from "mongoose";

const router = Router();

router.post(
  "/send",
  checkBody,
  isTwoWayConnection,
  canMakeTransaction,
  async (req: RequestWithAccountNumber, res, next) => {
    try {
      const { accountNumber: sender } = req;
      const { accountNumber: receiver, amount } = req.body;

      const senderDb = await User.findOne(
        { accountNumber: sender },
        { _id: 1 }
      );
      const receiverDb = await User.findOne(
        { accountNumber: receiver },
        { _id: 1 }
      );

      if (!senderDb || !receiverDb) {
        throw createCustomError("NotFoundError", "Account not found");
      }

      if (connection.readyState !== 1) {
        connect(process.env.DB_HOST as string, {
          dbName: "the-power",
        });
      }

      await transactionsQueue.add(
        "transactions",
        {
          sender: senderDb._id,
          receiver: receiverDb._id,
          amount,
        },
        { delay: 60000 }
      );

      res.status(204).json({});
    } catch (error) {
      next(error);
    }
  }
);

router.get("/received", async (req: RequestWithAccountNumber, res, next) => {
  try {
    const { accountNumber } = req;

    const user = await User.findOne({ accountNumber }, { _id: 1 });

    const transactions = await Transaction.find(
      {
        receiver: user?._id,
      },
      { _id: 0, __v: 0, updatedAt: 0, commision: 0, receiver: 0 }
    ).populate("sender", "-_id firstName lastName accountNumber");

    if (!transactions) {
      throw createCustomError(
        "NotFoundError",
        "No transactions found received by this account"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/sent", async (req: RequestWithAccountNumber, res, next) => {
  try {
    const { accountNumber } = req;

    const user = await User.findOne({ accountNumber }, { _id: 1 });

    const transactions = await Transaction.find(
      {
        sender: user?._id,
      },
      { _id: 0, __v: 0, updatedAt: 0, commision: 0, sender: 0 }
    ).populate("receiver", "-_id firstName lastName accountNumber");

    if (!transactions) {
      throw createCustomError(
        "NotFoundError",
        "No transactions found received by this account"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/commisions", isAdmin, async (_req, res, next) => {
  try {
    const commisions = await Transaction.aggregate(
      [
        {
          $group: {
            _id: null,
            totalCommision: { $sum: "$commision" },
          },
        },
      ],
      { _id: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        totalCommision: commisions[0]?.totalCommision ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
