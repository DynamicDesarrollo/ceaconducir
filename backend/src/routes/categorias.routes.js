import { Router } from "express";
import {
  crearCategoria,
  getCategorias,
  actualizarCategoria,
  eliminarCategoria
} from "../controllers/categorias.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getCategorias);
router.post("/", verificarToken, crearCategoria);
router.put("/:id", verificarToken, actualizarCategoria);
router.delete("/:id", verificarToken, eliminarCategoria);

export default router;