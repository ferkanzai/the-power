import { Router } from "express";
import { isTwoWayConnection } from "../middlewares/connections";
import { canMakeTransaction } from "../middlewares/transactions";
import { checkBody } from "../middlewares/utils";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError, saveTransactionToFile } from "../utils";

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

      console.log(senderDb, receiverDb);

      const transaction = await Transaction.create({
        amount,
        receiver: receiverDb?._id,
        sender: senderDb?._id,
      });

      const transactionToFile = {
        amount: req.body.amount,
        createdAt: transaction.createdAt,
        receiver: receiver as number,
        sender: sender as number,
      };

      saveTransactionToFile(transactionToFile);

      res.status(200).json({
        success: true,
        data: {
          transaction: {
            amount,
            createdAt: transaction.createdAt,
            receiver,
            sender,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
