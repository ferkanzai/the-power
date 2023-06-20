import { Router } from "express";
import authRouter from "./auth";
import pingRouter from "./ping";

const router = Router();

router.use("/ping", pingRouter);
router.use("/auth", authRouter);

export default router;
