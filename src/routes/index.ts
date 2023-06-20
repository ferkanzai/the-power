import { Router } from "express";
import authRouter from "./auth";
import pingRouter from "./ping";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.use("/ping", isAuthenticated, pingRouter);
router.use("/auth", authRouter);

export default router;
