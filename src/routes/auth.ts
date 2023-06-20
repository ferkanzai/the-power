import { Router } from "express";
import {
  creatRandomAccountNumber,
  generateRandomPassword,
  isEmptyBody,
} from "../utils";
import { hashSync } from "bcrypt";
import { User, UserSignup } from "../models/User";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    if (isEmptyBody(req.body)) {
      res.status(400).json({
        message: "Body can not be empty!",
      });
      return;
    }

    if (!req.body.firstName || !req.body.lastName || !req.body.initialBalance) {
      res.status(400).json({
        message:
          "First name, last name and initial balance are mandatory fields",
      });
      return;
    }

    const password = generateRandomPassword();

    const newUser: UserSignup = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      initialBalance: req.body.initialBalance,
      password: hashSync(password, 10),
      accountNumber: creatRandomAccountNumber(),
    };

    const result = await User.create(newUser);

    res.status(201).json({
      status: "ok",
      data: {
        accountNumber: result.accountNumber,
        password,
        lastName: result.lastName,
        firstName: result.firstName,
        initialBalance: result.initialBalance,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
