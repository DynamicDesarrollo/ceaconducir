import { Router } from 'express';
import { crearUsuario, listarUsuarios, actualizarUsuario, eliminarUsuario } from '../controllers/usuarios.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Solo admin puede crear usuarios
router.post('/', verificarToken, crearUsuario);
// Listar usuarios (solo autenticados)
router.get('/', verificarToken, listarUsuarios);

// Actualizar usuario (solo admin)
router.put('/:id', verificarToken, actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/:id', verificarToken, eliminarUsuario);

export default router;
