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

    let empresa_id = req.user?.empresa_id;

    // Si viene null, buscar la primera empresa existente
    if (!empresa_id) {
      const empresaResult = await pool.query(`
        SELECT id
        FROM empresas
        LIMIT 1
      `);

      if (!empresaResult.rows.length) {
        return res.status(400).json({
          msg: "No existe ninguna empresa registrada",
        });
      }

      empresa_id = empresaResult.rows[0].id;
    }

    const result = await pool.query(
      `
      INSERT INTO combos
      (
        empresa_id,
        nombre,
        precio_combo
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING *
      `,
      [
        empresa_id,
        nombre,
        precio
      ]
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

    const result = await pool.query(`
      SELECT *
      FROM combos
      ORDER BY nombre
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR COMBOS:", error);

    res.status(500).json({
      msg: "Error obteniendo combos",
      error: error.message
    });
  }
};

// =============================
// 🔹 ACTUALIZAR COMBO
// =============================
export const actualizarCombo = async (req, res) => {
  try {

    const { id } = req.params;
    const { nombre, precio } = req.body;

    const result = await pool.query(
      `
      UPDATE combos
      SET
        nombre = $1,
        precio_combo = $2
      WHERE id = $3
      RETURNING *
      `,
      [
        nombre,
        precio,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg: "Error actualizando combo"
    });

  }
};

// =============================
// 🔹 ELIMINAR COMBO
// =============================
export const eliminarCombo = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM combos
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      msg: "Combo eliminado"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      msg: "Error eliminando combo"
    });

  }
};