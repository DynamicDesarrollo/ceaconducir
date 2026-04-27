import { Router } from "express";
import {
  crearTercero,
  getTerceros,
  getTerceroById,
  updateTercero,
  deleteTercero,
} from "../controllers/terceros.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verificarToken, crearTercero);
router.get("/", verificarToken, getTerceros);
router.get("/:id", verificarToken, getTerceroById);
router.put("/:id", verificarToken, updateTercero);
router.delete("/:id", verificarToken, deleteTercero);

export default router;