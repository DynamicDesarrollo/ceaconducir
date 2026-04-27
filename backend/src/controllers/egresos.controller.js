import { pool } from '../config/db.js';

// =============================
// 🔹 CREAR EGRESO
// =============================
export const crearEgreso = async (req, res) => {
  try {
    const {
      categoria_id,
      valor,
      vehiculo_id,
      descripcion,
      tercero_id,
    } = req.body;

    // ✅ Validaciones básicas
    if (!categoria_id || !valor) {
      return res.status(400).json({
        msg: 'Categoría y valor son obligatorios',
      });
    }

    // ✅ Validar categoría
    const categoria = await pool.query(
      `SELECT requiere_vehiculo, nombre 
       FROM categorias_egreso 
       WHERE id = $1`,
      [categoria_id]
    );

    if (categoria.rowCount === 0) {
      return res.status(404).json({
        msg: 'Categoría no encontrada',
      });
    }

    // ✅ Validar vehículo si aplica
    if (categoria.rows[0].requiere_vehiculo && !vehiculo_id) {
      return res.status(400).json({
        msg: 'Debe seleccionar vehículo',
      });
    }

    // ✅ Validar tercero (si viene)
    if (tercero_id) {
      const tercero = await pool.query(
        `SELECT id FROM terceros WHERE id = $1`,
        [tercero_id]
      );

      if (tercero.rowCount === 0) {
        return res.status(404).json({
          msg: 'Tercero no encontrado',
        });
      }
    }

    // ✅ Insertar egreso
    const egreso = await pool.query(
      `INSERT INTO egresos 
        (categoria_id, valor, vehiculo_id, descripcion, usuario_id, tercero_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        categoria_id,
        valor,
        vehiculo_id || null,
        descripcion || null,
        req.user.id,
        tercero_id || null,
      ]
    );

    res.json({
      msg: 'Egreso registrado correctamente',
      data: egreso.rows[0],
    });

  } catch (error) {
    console.error("ERROR CREAR EGRESO:", error);
    res.status(500).json({
      msg: "Error al registrar egreso",
      error: error.message,
    });
  }
};

// =============================
// 🔹 OBTENER EGRESOS (CON TERCERO)
// =============================
export const getEgresos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id,
        e.fecha,
        e.descripcion,
        e.valor AS monto,

        c.nombre AS categoria,
        v.placa AS vehiculo,
        t.nombre AS tercero

      FROM egresos e
      LEFT JOIN categorias_egreso c ON c.id = e.categoria_id
      LEFT JOIN vehiculos v ON v.id = e.vehiculo_id
      LEFT JOIN terceros t ON t.id = e.tercero_id

      ORDER BY e.fecha DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR EGRESOS:", error);
    res.status(500).json({
      msg: "Error al obtener egresos",
      error: error.message,
    });
  }
};

// =============================
// 🔹 OBTENER CATEGORÍAS
// =============================
export const getCategoriasEgreso = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre 
       FROM categorias_egreso 
       ORDER BY nombre`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("ERROR CATEGORIAS EGRESO:", error);
    res.status(500).json({
      msg: "Error al obtener categorías",
      error: error.message,
    });
  }
};