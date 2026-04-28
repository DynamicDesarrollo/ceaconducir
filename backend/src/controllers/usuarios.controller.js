import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

// =============================
// 🔹 CREAR USUARIO (solo Admin)
// =============================
export const crearUsuario = async (req, res) => {
  try {
    // Solo admin puede crear usuarios
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'No autorizado' });
    }
    const { nombre, email, password, rol_id, empresa_id } = req.body;
    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios' });
    }
    // Verificar si el email ya existe
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rowCount > 0) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol_id, empresa_id, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nombre, email, rol_id, empresa_id, activo`,
      [nombre, email, hash, rol_id, empresa_id || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('ERROR CREAR USUARIO:', error);
    res.status(500).json({ msg: 'Error al crear usuario', error: error.message });
  }
};

// =============================
// 🔹 LISTAR USUARIOS
// =============================
export const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, r.nombre AS rol, u.empresa_id
       FROM usuarios u
       LEFT JOIN roles r ON r.id = u.rol_id
       ORDER BY u.nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('ERROR LISTAR USUARIOS:', error);
    res.status(500).json({ msg: 'Error al obtener usuarios', error: error.message });
  }
};


// =============================
// 🔹 ACTUALIZAR USUARIO
// =============================
export const actualizarUsuario = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'No autorizado' });
    }
    const { id } = req.params;
    const { nombre, email, password, rol_id, empresa_id } = req.body;
    if (!nombre || !email || !rol_id) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios' });
    }
    let query = `UPDATE usuarios SET nombre=$1, email=$2, rol_id=$3, empresa_id=$4`;
    let values = [nombre, email, rol_id, empresa_id || null];
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += `, password=$5`;
      values.push(hash);
      query += ` WHERE id=$6 RETURNING id, nombre, email, rol_id, empresa_id, activo`;
      values.push(id);
    } else {
      query += ` WHERE id=$5 RETURNING id, nombre, email, rol_id, empresa_id, activo`;
      values.push(id);
    }
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('ERROR ACTUALIZAR USUARIO:', error);
    res.status(500).json({ msg: 'Error al actualizar usuario', error: error.message });
  }
};

// =============================
// 🔹 ELIMINAR USUARIO
// =============================
export const eliminarUsuario = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'No autorizado' });
    }
    const { id } = req.params;
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    console.error('ERROR ELIMINAR USUARIO:', error);
    res.status(500).json({ msg: 'Error al eliminar usuario', error: error.message });
  }
};
