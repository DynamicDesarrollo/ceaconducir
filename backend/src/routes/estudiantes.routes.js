import { Router } from 'express';
import {
  crearEstudiante,
  getEstudiantes,
  updateEstudiante,
  deleteEstudiante,
  getCuentaEstudiante,
  crearEstudianteConMatricula
} from "../controllers/estudiantes.controller.js";
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// 🔥 ESTA VA PRIMERO
router.get("/cuenta/:id", verificarToken, getCuentaEstudiante);

router.post("/", verificarToken, crearEstudiante);
// Crear estudiante + matrícula en una sola transacción
router.post("/crear-con-matricula", verificarToken, crearEstudianteConMatricula);
router.get("/", verificarToken, getEstudiantes);
router.put("/:id", verificarToken, updateEstudiante);
router.delete("/:id", verificarToken, deleteEstudiante);

export default router;