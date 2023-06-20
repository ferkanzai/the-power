import { Router } from "express";
import authRouter from "./auth";
import pingRouter from "./ping";
import { isAdmin, isAuthenticated } from "../middlewares/auth";

const router = Router();

router.use("/ping", isAuthenticated, isAdmin, pingRouter);
router.use("/auth", authRouter);

export default router;
