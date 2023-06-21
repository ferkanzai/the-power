import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import authRouter from "./auth";
import connectionsRouter from "./connections";
import pingRouter from "./ping";
import requestsRouter from "./requests"

const router = Router();

router.use("/auth", authRouter);
router.use("/connections", isAuthenticated, connectionsRouter);
router.use("/ping", isAuthenticated, isAdmin, pingRouter);
router.use("/requests", isAuthenticated, requestsRouter);

export default router;
