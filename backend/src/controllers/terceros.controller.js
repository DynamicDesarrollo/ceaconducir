import { pool } from "../config/db.js";

// 🔹 Crear tercero
export const crearTercero = async (req, res) => {
  try {
    const { nombre, tipo, telefono, email } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: "Nombre es obligatorio" });
    }

    const result = await pool.query(
      `INSERT INTO terceros (nombre, tipo, telefono, email)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre, tipo, telefono, email]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ERROR CREAR TERCERO:", error);
    res.status(500).json({ msg: "Error al crear tercero" });
  }
};

// 🔹 Obtener todos
export const getTerceros = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM terceros ORDER BY nombre`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET TERCEROS:", error);
    res.status(500).json({ msg: "Error al obtener terceros" });
  }
};

// 🔹 Obtener uno
export const getTerceroById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM terceros WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Tercero no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ERROR GET TERCERO:", error);
    res.status(500).json({ msg: "Error al obtener tercero" });
  }
};

// 🔹 Actualizar
export const updateTercero = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, telefono, email } = req.body;

    const result = await pool.query(
      `UPDATE terceros 
       SET nombre=$1, tipo=$2, telefono=$3, email=$4
       WHERE id=$5 RETURNING *`,
      [nombre, tipo, telefono, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Tercero no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ERROR UPDATE TERCERO:", error);
    res.status(500).json({ msg: "Error al actualizar tercero" });
  }
};

// 🔹 Eliminar
export const deleteTercero = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM terceros WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "Tercero no encontrado" });
    }

    res.json({ msg: "Tercero eliminado" });
  } catch (error) {
    console.error("ERROR DELETE TERCERO:", error);
    res.status(500).json({ msg: "Error al eliminar tercero" });
  }
};