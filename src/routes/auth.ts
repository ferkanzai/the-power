import { compareSync, hashSync } from "bcrypt";
import { Router } from "express";
import { SignJWT } from "jose";
import { checkBody } from "../middlewares/utils";
import User from "../models/User";
import {
  createCustomError,
  generateRandomAccountNumber,
  generateRandomPassword,
  sanitizeUser,
  secret,
} from "../utils";

const router = Router();

router.post("/signup", checkBody, async (req, res, next) => {
  try {
    const password = generateRandomPassword();

    const newUser = {
      accountNumber: generateRandomAccountNumber(),
      age: req.body.age,
      firstName: req.body.firstName,
      initialBalance: req.body.initialBalance,
      lastName: req.body.lastName,
      password: hashSync(password, 10),
    };

    const result = await User.create(newUser);

    res.status(201).json({
      success: true,
      data: {
        ...sanitizeUser(result),
        password,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signin", checkBody, async (req, res, next) => {
  try {
    const user = await User.findOne({
      accountNumber: req.body.accountNumber,
    });

    if (!user) {
      throw createCustomError("NotFoundError", "Account not found");
    }

    const checkPassword = compareSync(req.body.password, user.password);

    if (!checkPassword) {
      throw createCustomError("UnauthorizedError");
    }

    const sanitizedUser = sanitizeUser(user);

    const token = await new SignJWT({ user: sanitizedUser })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setIssuer("fercarmona.dev")
      .setExpirationTime("15m")
      .sign(secret);

    res.status(200).json({
      success: true,
      data: {
        ...sanitizedUser,
        token: `Bearer ${token}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
