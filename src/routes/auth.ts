import { compareSync, hashSync } from "bcrypt";
import { Router } from "express";
import { SignJWT } from "jose";
import User from "../models/User";
import {
  generateRandomAccountNumber,
  createCustomError,
  generateRandomPassword,
  isEmptyBody,
  sanitizeUser,
  secret,
} from "../utils";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    if (isEmptyBody(req.body)) {
      createCustomError("BadRequestError", "Body can not be empty!");
    }

    if (!req.body.firstName || !req.body.lastName || !req.body.initialBalance) {
      throw createCustomError(
        "BadRequestError",
        "First name, last name and initial balance are mandatory fields"
      );
    }

    const password = generateRandomPassword();

    const newUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      initialBalance: req.body.initialBalance,
      password: hashSync(password, 10),
      accountNumber: generateRandomAccountNumber(),
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

router.post("/signin", async (req, res, next) => {
  try {
    if (isEmptyBody(req.body)) {
      throw createCustomError("BadRequestError", "Body can not be empty!");
    }

    if (!req.body.accountNumber || !req.body.password) {
      throw createCustomError(
        "BadRequestError",
        "Account number and password are mandatory fields"
      );
    }

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
