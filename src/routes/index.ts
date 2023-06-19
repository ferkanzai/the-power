import { Router } from "express";
import pingRoute from "./ping"

const router = Router();

router.use("/ping", pingRoute);

export default router;