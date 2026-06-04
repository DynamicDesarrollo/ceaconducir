import { Router } from "express";
import {
  crearCombo,
  getCombos, actualizarCombo,
  eliminarCombo
} from "../controllers/combos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getCombos);
router.post("/", verificarToken, crearCombo);
router.put("/:id", verificarToken, actualizarCombo);
router.delete("/:id", verificarToken, eliminarCombo);

export default router;