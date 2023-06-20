import { Router } from "express";
import User, { type PayloadWithUser } from "../models/User";
import { createCustomError, secret } from "../utils";
import { jwtVerify } from "jose";

const router = Router();

router.get("/:accountNumber", async (req, res, next) => {
  try {
    const { accountNumber } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    const { payload } = await jwtVerify(token as string, secret, {
      issuer: "fercarmona.dev",
      maxTokenAge: "15m",
    });

    const { user } = payload as PayloadWithUser;

    if (user.accountNumber !== Number(accountNumber)) {
      throw createCustomError("UnauthorizedError");
    }

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
      data: result.connections,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
