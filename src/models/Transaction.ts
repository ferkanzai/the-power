import { Document, Schema, Types, model } from "mongoose";

export interface Transaction extends Document {
  amount: number;
  createdAt: Date;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  updatedAt: Date;
  commision: number;
  completed: boolean;
}

export type TransactionWithAccounts = Pick<
  Transaction,
  "amount" | "createdAt"
> & {
  sender: number;
  receiver: number;
};

export const TransactionSchema = new Schema<Transaction>(
  {
    amount: {
      type: Number,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commision: {
      type: Number,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TransactionSchema.post("save", async function (doc) {
//   const { sender, receiver, amount } = doc;
//   const commision = calculateCommission(amount);
//   const amountToDeduct = amount + commision;

//   await this.updateOne({ commision });

//   await this.$model("User").findByIdAndUpdate(sender, {
//     $inc: { balance: -amountToDeduct },
//   });

//   await this.$model("User").findByIdAndUpdate(receiver, {
//     $inc: { balance: amount },
//   });
// });

export default model<Transaction>("Transaction", TransactionSchema);
