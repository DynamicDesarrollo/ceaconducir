import { Router } from "express";
import {
  crearVehiculo,
  getVehiculos
} from "../controllers/vehiculos.controller.js";

import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, getVehiculos);
router.post("/", verificarToken, crearVehiculo);

export default router;