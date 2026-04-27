import { Router } from "express";
import { login } from "../api/auth.js";

const router = Router();

router.post("/login", login);

export default router;