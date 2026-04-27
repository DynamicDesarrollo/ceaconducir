import { Router } from "express";
import {
  crearCategoria,
  getCategorias,
} from "../controllers/categorias.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getCategorias);
router.post("/", verificarToken, crearCategoria);

export default router;