import { Queue, Worker } from "bullmq";
import Transaction from "../models/Transaction";
import User from "../models/User";
import {
  calculateCommission,
  saveTransactionToFile,
  specialAccountNumber,
} from "../utils";

export const transactionsQueue = new Queue("transactions", {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT as string),
  },
});

const worker = new Worker(
  "transactions",
  async (job) => {
    try {
      const { sender, receiver, amount } = job.data;

      const senderAccount = await User.findById(sender, {
        balance: 1,
        accountNumber: 1,
      });
      const receiverAccount = await User.findById(receiver, {
        balance: 1,
        accountNumber: 1,
      });
      const specialAccount = await User.findOne(
        { accountNumber: specialAccountNumber },
        { balance: 1, _id: 1 }
      );

      if (!senderAccount || !receiverAccount || !specialAccount) {
        throw new Error("Account not found");
      }

      const commision = calculateCommission(amount);

      if (senderAccount.balance < amount + commision) {
        throw new Error("Insufficient funds");
      }

      console.log(senderAccount);

      senderAccount.balance -= amount + commision;
      await senderAccount.save();

      console.log(senderAccount);
      console.log(specialAccount);

      specialAccount.balance += amount;
      await specialAccount.save();
      console.log(specialAccount);

      const delay = 60000;
      if (!job.delay || !(await job.isDelayed())) {
        await job.moveToDelayed(Date.now() + delay);
      }

      if (await job.isCompleted()) {
        receiverAccount.balance += amount;
        await receiverAccount.save();

        specialAccount.balance -= amount;
        await specialAccount.save();

        const transaction = new Transaction({
          sender,
          receiver,
          amount,
          commission: commision,
          completed: true,
        });
        await transaction.save();

        const transactionToFile = {
          amount,
          createdAt: transaction.createdAt,
          receiver: receiver as number,
          sender: sender as number,
        };

        saveTransactionToFile(transactionToFile);
      } else if (await job.isFailed()) {
        senderAccount.balance += amount + commision;
        await senderAccount.save();

        specialAccount.balance -= amount;
        await specialAccount.save();

        const transaction = new Transaction({
          sender,
          receiver,
          amount,
          commission: commision,
          completed: false,
        });
        await transaction.save();
      }
    } catch (error) {
      console.error(error);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT as string),
    },
    lockDuration: 120000,
    maxStalledCount: 0,
  }
);

worker.on("active", () => {
  console.log("Progress");
});
