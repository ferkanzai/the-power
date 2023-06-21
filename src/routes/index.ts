import { Router } from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth";
import authRouter from "./auth";
import connectionsRouter from "./connections";
import pingRouter from "./ping";
import requestsRouter from "./requests";
import transactionsRouter from "./transactions";
import { isSameAccount } from "../middlewares/connections";

const router = Router();

router.use("/auth", authRouter);
router.use("/connections", isAuthenticated, isSameAccount, connectionsRouter);
router.use("/ping", isAuthenticated, isAdmin, pingRouter);
router.use("/requests", isAuthenticated, requestsRouter);
router.use("/transactions", isAuthenticated, isSameAccount, transactionsRouter);

export default router;
