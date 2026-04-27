import { pool } from "../config/db.js";

// 🔹 CREAR CATEGORIA
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, precio_total } = req.body;

    if (!nombre || !precio_total) {
      return res.status(400).json({
        msg: "Nombre y precio son obligatorios",
      });
    }

    const result = await pool.query(
      `INSERT INTO categorias (nombre, precio_total)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, precio_total]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR CREAR CATEGORIA:", error);
    res.status(500).json({
      msg: "Error al crear categoría",
    });
  }
};

// 🔹 GET
export const getCategorias = async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM categorias ORDER BY nombre"
  );
  res.json(result.rows);
};