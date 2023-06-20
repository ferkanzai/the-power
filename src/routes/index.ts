import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import authRouter from "./auth";
import connectionsRouter from "./connections";
import pingRouter from "./ping";

const router = Router();

router.use("/ping", isAuthenticated, isAdmin, pingRouter);
router.use("/auth", authRouter);
router.use("/connections", isAuthenticated, connectionsRouter);

export default router;
