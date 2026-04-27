import { Router } from "express";
import {
  crearEgreso,
  getEgresos,
  getCategoriasEgreso,
} from "../controllers/egresos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ✔ EGRESOS
router.get("/", verificarToken, getEgresos);

// ✔ CATEGORÍAS (AQUÍ ESTÁ EL FIX)
router.get("/categorias", verificarToken, getCategoriasEgreso);

// ✔ CREAR
router.post("/", verificarToken, crearEgreso);

export default router;