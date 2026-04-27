import { Router } from "express";
import {
  crearCombo,
  getCombos,
} from "../controllers/combos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getCombos); 
router.post("/", verificarToken, crearCombo);

export default router;