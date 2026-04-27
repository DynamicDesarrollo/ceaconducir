import { pool } from "../config/db.js";

// 🔥 CREAR VEHICULO
export const crearVehiculo = async (req, res) => {
  try {
    const { placa, tipo, marca } = req.body;

    if (!placa) {
      return res.status(400).json({ msg: "La placa es obligatoria" });
    }

    const result = await pool.query(
      `INSERT INTO vehiculos (placa, tipo, marca, empresa_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [placa, tipo || null, marca || null, req.user.empresa_id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR CREAR VEHICULO:", error);
    res.status(500).json({ msg: "Error al crear vehículo" });
  }
};

// 🔥 LISTAR
export const getVehiculos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, placa, tipo, marca
      FROM vehiculos
      WHERE activo = true
      ORDER BY placa
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR VEHICULOS:", error);
    res.status(500).json({ msg: "Error al obtener vehículos" });
  }
};