import { pool } from '../config/db.js';

// =============================
// 🟢 REGISTRAR PAGO
// =============================
export const registrarPago = async (req, res) => {
    let {
        estudiante_id,
        categoria_id,
        combo_id,
        monto
    } = req.body;

    // ✅ SOLO UNA DEFINICIÓN
    const es_combo = combo_id ? true : false;

    try {
        // =============================
        // 🧹 NORMALIZAR
        // =============================
        categoria_id = categoria_id || null;
        combo_id = combo_id || null;
        monto = monto ? Number(monto) : 0;

        // =============================
        // 🔒 VALIDACIONES BÁSICAS
        // =============================
        if (!estudiante_id) {
            return res.status(400).json({ error: "estudiante_id es requerido" });
        }

        if (es_combo && !combo_id) {
            return res.status(400).json({ error: "combo_id requerido" });
        }

        // =============================
        // 🔥 1. OBTENER ESTUDIANTE (PRIMERO SIEMPRE)
        // =============================
        const estudianteDB = await pool.query(
            `SELECT total_curso, total_pagado 
             FROM estudiantes 
             WHERE id = $1`,
            [estudiante_id]
        );

        if (estudianteDB.rows.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        let totalCurso = Number(estudianteDB.rows[0].total_curso || 0);
        let totalPagadoActual = Number(estudianteDB.rows[0].total_pagado || 0);
        const tieneCurso = totalCurso > 0;

        // =============================
        // 🔒 VALIDACIÓN PRIMER PAGO
        // =============================
        if (!tieneCurso && !categoria_id && !es_combo) {
            return res.status(400).json({
                error: "Debes seleccionar una categoría para el primer pago"
            });
        }

        // =============================
        // 💰 2. DEFINIR PRECIO BASE
        // =============================
        let precioBase = 0;

        if (es_combo) {
            const combo = await pool.query(
                "SELECT precio_combo FROM combos WHERE id = $1",
                [combo_id]
            );

            if (combo.rows.length === 0) {
                return res.status(404).json({ error: "Combo no encontrado" });
            }

            precioBase = Number(combo.rows[0].precio_combo);

        } else {
            if (tieneCurso) {
                precioBase = totalCurso;
            } else {
                const categoria = await pool.query(
                    "SELECT precio_total FROM categorias WHERE id = $1",
                    [categoria_id]
                );

                if (categoria.rows.length === 0) {
                    return res.status(404).json({ error: "Categoría no encontrada" });
                }

                precioBase = Number(categoria.rows[0].precio_total);
            }
        }

        // =============================
        // 💰 3. MONTO FINAL
        // =============================
        const montoFinal = monto > 0 ? monto : precioBase;

        // =============================
        // 🔥 4. ASIGNAR CURSO SI ES PRIMER PAGO
        // =============================
        if (!tieneCurso) {
            totalCurso = precioBase;

            await pool.query(
                `UPDATE estudiantes 
                 SET total_curso = $1
                 WHERE id = $2`,
                [totalCurso, estudiante_id]
            );
        }

        // =============================
        // 🔒 5. VALIDAR SOBREPAGO
        // =============================
        if (totalPagadoActual + montoFinal > totalCurso) {
            return res.status(400).json({
                error: "No puedes pagar más de lo que debe"
            });
        }

        // =============================
        // 🧠 6. DEFINIR CATEGORÍA FINAL
        // =============================
        let categoriaFinal = categoria_id;

        if (!categoriaFinal && !es_combo) {
            const categoriaExistente = await pool.query(
                `SELECT categoria_id 
                 FROM pagos 
                 WHERE estudiante_id = $1 
                   AND categoria_id IS NOT NULL
                 ORDER BY fecha ASC 
                 LIMIT 1`,
                [estudiante_id]
            );

            if (categoriaExistente.rows.length > 0) {
                categoriaFinal = categoriaExistente.rows[0].categoria_id;
            }
        }

        if (!categoriaFinal && !es_combo) {
            return res.status(400).json({
                error: "No se pudo determinar la categoría"
            });
        }

        // =============================
        // 💾 7. INSERTAR PAGO
        // =============================
        const result = await pool.query(
            `INSERT INTO pagos (
    estudiante_id,
    categoria_id,
    combo_id,
    es_combo,
    monto
  )
  VALUES ($1, $2, $3, $4, $5)`,
            [
                estudiante_id,
                categoria_id || null,
                combo_id || null,
                es_combo,
                montoFinal // ✅ FIX REAL
            ]
        );
        // =============================
        // 📊 8. ACTUALIZAR CUENTA
        // =============================
        await pool.query(`
            INSERT INTO cuentas_estudiante (estudiante_id, total_curso, total_pagado, saldo)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (estudiante_id)
            DO UPDATE SET
                total_curso = EXCLUDED.total_curso,
                total_pagado = cuentas_estudiante.total_pagado + EXCLUDED.total_pagado,
                saldo = GREATEST(EXCLUDED.total_curso - (cuentas_estudiante.total_pagado + EXCLUDED.total_pagado), 0)
        `, [
            estudiante_id,
            totalCurso,
            montoFinal,
            totalCurso - (totalPagadoActual + montoFinal)
        ]);

        // =============================
        // 📊 9. CALCULAR ESTADO
        // =============================
        const nuevoTotalPagado = totalPagadoActual + montoFinal;
        const nuevoSaldo = totalCurso - nuevoTotalPagado;

        let estado = "Pendiente";
        if (nuevoSaldo <= 0) estado = "Pagado";
        else if (nuevoTotalPagado > 0) estado = "Abonado";

        // =============================
        // 🧠 10. ACTUALIZAR ESTUDIANTE
        // =============================
        await pool.query(
            `UPDATE estudiantes 
             SET total_pagado = $1,
                 saldo = $2,
                 estado_pago = $3
             WHERE id = $4`,
            [nuevoTotalPagado, nuevoSaldo, estado, estudiante_id]
        );

        // =============================
        // 🚀 RESPUESTA
        // =============================
        res.json({
            pago: result.rows[0],
            resumen: {
                total_pagado: nuevoTotalPagado,
                saldo: nuevoSaldo,
                estado
            }
        });

    } catch (err) {
        console.error("ERROR REGISTRAR PAGO:", err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// 🔵 LISTAR PAGOS
// =============================
export const getPagos = async (req, res) => {
    console.log("USER EN GET COMBOS 👉", req.user);
    try {
        const result = await pool.query(`
           SELECT 
    p.id,
    p.fecha,
    p.monto,
    p.es_combo,

    e.id AS estudiante_id,
    e.nombre AS estudiante,

    c.nombre AS categoria,
    co.nombre AS combo,

    ce.total_curso,
    ce.total_pagado,
    ce.saldo

FROM pagos p


LEFT JOIN estudiantes e 
    ON e.id = p.estudiante_id

LEFT JOIN categorias c 
    ON c.id = p.categoria_id

LEFT JOIN combos co 
    ON co.id = p.combo_id

LEFT JOIN cuentas_estudiante ce 
    ON ce.estudiante_id = p.estudiante_id

ORDER BY p.fecha DESC;
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("ERROR PAGOS:", error);
        res.status(500).json({
            msg: "Error al obtener pagos",
            error: error.message
        });
    }
};
export const getDetalleEstudiante = async (req, res) => {
    const { id } = req.params;

    try {

        // 🧠 INFO PRINCIPAL
        const estudiante = await pool.query(`
            SELECT 
                id,
                nombre,
                total_curso,
                total_pagado,
                saldo,
                estado_pago
            FROM estudiantes
            WHERE id = $1
        `, [id]);

        // 📚 HISTORIAL DE PAGOS
        const historial = await pool.query(`
            SELECT 
                fecha,
                monto,
                es_combo,
                categoria_id,
                combo_id
            FROM pagos
            WHERE estudiante_id = $1
            ORDER BY fecha DESC
        `, [id]);

        res.json({
            estudiante: estudiante.rows[0],
            historial: historial.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// =============================
// 🟣 DETALLE FINANCIERO POR ESTUDIANTE
// =============================
export const getPagosByEstudiante = async (req, res) => {
    const { id } = req.params;

    try {
        const estudiante = await pool.query(`
            SELECT 
                id,
                nombre,
                total_curso,
                total_pagado,
                saldo,
                estado_pago
            FROM estudiantes
            WHERE id = $1
        `, [id]);

        if (estudiante.rows.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        const historial = await pool.query(`
            SELECT 
                fecha,
                monto
            FROM pagos
            WHERE estudiante_id = $1
            ORDER BY fecha DESC
        `, [id]);

        // 🔥 MISMO FORMATO EN TODOS
        res.json({
            estudiante: estudiante.rows[0],
            historial: historial.rows
        });

    } catch (error) {
        console.error("ERROR DETALLE ESTUDIANTE:", error);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarPago = async (req, res) => {
  const { id } = req.params;

  try {
    const pago = await pool.query(
      "SELECT * FROM pagos WHERE id = $1",
      [id]
    );

    if (pago.rows.length === 0) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    const estudiante_id = pago.rows[0].estudiante_id;

    await pool.query("DELETE FROM pagos WHERE id = $1", [id]);

    // 🔥 recalcular cuenta
    await recalcularCuenta(estudiante_id);

    res.json({ msg: "Pago eliminado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar pago" });
  }
};

export const actualizarPago = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;

  try {
    const pago = await pool.query(
      "SELECT * FROM pagos WHERE id = $1",
      [id]
    );

    if (pago.rows.length === 0) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    const estudiante_id = pago.rows[0].estudiante_id;

    await pool.query(
      `UPDATE pagos SET monto = $1 WHERE id = $2`,
      [monto, id]
    );

    // 🔥 recalcular cuenta
    await recalcularCuenta(estudiante_id);

    res.json({ msg: "Pago actualizado" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar pago" });
  }
};