import { Router } from "express";
import {
  crearEgreso,
  getEgresos,
  getCategoriasEgreso,
  crearCategoriaEgreso,
} from "../controllers/egresos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// ✔ EGRESOS
router.get("/", verificarToken, getEgresos);

// ✔ CATEGORÍAS
router.get("/categorias", verificarToken, getCategoriasEgreso);
router.post("/categorias", verificarToken, (req, res, next) => {
  console.log("🔥 POST /egresos/categorias OK");
  next();
}, crearCategoriaEgreso);

// ✔ CREAR
router.post("/", verificarToken, crearEgreso);

export default router;