import { Router } from "express";
import User from "../models/User";
import { RequestWithAccountNumber } from "../types/app";
import { createCustomError } from "../utils";

const router = Router();

router.get("/all", async (req: RequestWithAccountNumber, res, next) => {
  try {
    const { accountNumber } = req;

    const result = await User.findOne({ accountNumber }).populate(
      "requests",
      "-_id age firstName lastName accountNumber",
      "User"
    );

    if (!result) {
      throw createCustomError("NotFoundError");
    }

    res.status(200).json({
      success: true,
      data: { requests: result.requests },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
