import { Router } from 'express';
import { 
     registrarPago,
     getPagos,
     getDetalleEstudiante,
     getPagosByEstudiante,
     actualizarPago,
     eliminarPago
} from '../controllers/pagos.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// crear pago
router.post('/', verificarToken, registrarPago);

// listar pagos
router.get('/', verificarToken, getPagos);

router.get("/pagos/estudiante/:id", verificarToken,getDetalleEstudiante);

router.get("/estudiante/:id",  getPagosByEstudiante);

router.put("/pagos/:id", verificarToken, actualizarPago);

router.delete("/:id", verificarToken, eliminarPago);

export default router;