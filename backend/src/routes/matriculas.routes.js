import { Router } from "express";
import { crearMatricula, getMatriculaCompleta, generarContratoWord } from "../controllers/matriculas.controller.js";

const router = Router();

router.post("/", crearMatricula);

// GET /matriculas/:id/completa
router.get("/:id/completa", getMatriculaCompleta);

// GET /matriculas/:id/contrato
router.get("/:id/contrato", generarContratoWord);

export default router;
