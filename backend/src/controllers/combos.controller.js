import { pool } from "../config/db.js";

// =============================
// 🔹 CREAR COMBO
// =============================
export const crearCombo = async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    console.log("USER EN COMBO 👉", req.user);

    if (!nombre || !precio) {
      return res.status(400).json({
        msg: "Nombre y precio son obligatorios",
      });
    }

    const empresa_id = req.user.empresa_id; // 🔥 AQUÍ ESTÁ LA CLAVE

    const result = await pool.query(
      `INSERT INTO combos (empresa_id, nombre, precio_combo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [empresa_id, nombre, precio]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR CREAR COMBO:", error);
    res.status(500).json({
      msg: "Error al crear combo",
      error: error.message
    });
  }
};
// =============================
// 🔹 OBTENER COMBOS
// =============================
export const getCombos = async (req, res) => {
  try {

    console.log("USER:", req.user);

    const result = await pool.query(`
      SELECT *
      FROM combos
      ORDER BY nombre
    `);

    console.log("COMBOS:", result.rows);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};