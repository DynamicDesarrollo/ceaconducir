import { pool } from "../config/db.js";

/* =========================
   CREAR
========================= */
export const crearEstudiante = async (req, res) => {
    try {
        const {
            nombre,
            documento,
            telefono,
            direccion,
            email
        } = req.body;

        const result = await pool.query(
            `INSERT INTO estudiantes 
            (nombre, documento, telefono, direccion, email, total_curso, total_pagado, saldo, estado_pago)
            VALUES ($1,$2,$3,$4,$5,0,0,0,'Sin pago')
            RETURNING *`,
            [nombre, documento, telefono, direccion, email]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("ERROR CREAR ESTUDIANTE:", error);
        res.status(500).json({ error: error.message });
    }
};


/* =========================
   LISTAR + FILTRO + PAGINACIÓN
========================= */
export const getEstudiantes = async (req, res) => {
    try {
        const { q = "", page = 1, limit = 5, mes, anio } = req.query;

        const offset = (page - 1) * limit;
        const filtro = `%${q.toLowerCase()}%`;

        const mesNumero = mes ? parseInt(mes) : null;
        const anioNumero = anio ? parseInt(anio) : new Date().getFullYear();

        const result = await pool.query(`
            SELECT 
                e.id,
                e.nombre,
                e.documento,
                e.telefono,
                e.direccion,
                e.email,
                e.created_at,
                COALESCE(ce.total_curso,0) as total_curso,
                COALESCE(ce.total_pagado,0) as total_pagado,
                COALESCE(ce.saldo,0) as saldo,
                CASE 
                    WHEN COALESCE(ce.saldo,0) = 0 AND COALESCE(ce.total_curso,0) > 0 THEN 'Pagado'
                    WHEN COALESCE(ce.total_pagado,0) = 0 THEN 'Sin pago'
                    ELSE 'Pendiente'
                END as estado_pago
            FROM estudiantes e
            LEFT JOIN cuentas_estudiante ce 
                ON ce.estudiante_id = e.id
            WHERE 
                ($1 = '%%' OR LOWER(e.nombre) LIKE $1 OR e.documento::text LIKE $1)
                AND (
                    $4::int IS NULL
                    OR (
                        e.created_at >= DATE_TRUNC('month', MAKE_DATE($5, $4, 1))
                        AND e.created_at < DATE_TRUNC('month', MAKE_DATE($5, $4, 1)) + INTERVAL '1 month'
                    )
                )
            ORDER BY e.nombre
            LIMIT $2 OFFSET $3
        `, [filtro, limit, offset, mesNumero, anioNumero]);

        const total = await pool.query(`
            SELECT COUNT(*) 
            FROM estudiantes e
            WHERE 
                ($1 = '%%' OR LOWER(e.nombre) LIKE $1 OR e.documento::text LIKE $1)
                AND (
                    $2::int IS NULL
                    OR (
                        e.created_at >= DATE_TRUNC('month', MAKE_DATE($3, $2, 1))
                        AND e.created_at < DATE_TRUNC('month', MAKE_DATE($3, $2, 1)) + INTERVAL '1 month'
                    )
                )
        `, [filtro, mesNumero, anioNumero]);

        res.json({
            data: result.rows,
            total: parseInt(total.rows[0].count),
        });

    } catch (error) {
        console.error("ERROR ESTUDIANTES:", error);
        res.status(500).json({ msg: "Error al obtener estudiantes" });
    }
};


/* =========================
   OBTENER CUENTA FINANCIERA (🔥 CLAVE PARA PAGOS)
========================= */
export const getCuentaEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
  SELECT 
    ce.total_curso,
    ce.total_pagado,
    ce.saldo,
    p.categoria_id,
    p.combo_id,
    p.es_combo,
    c.nombre as categoria
  FROM cuentas_estudiante ce
  LEFT JOIN pagos p ON p.estudiante_id = ce.estudiante_id
  LEFT JOIN categorias c ON c.id = p.categoria_id
  WHERE ce.estudiante_id = $1
  ORDER BY p.fecha DESC
  LIMIT 1
`, [id]);

        if (result.rows.length === 0) {
            return res.json({
                total_curso: 0,
                total_pagado: 0,
                saldo: 0,
                categoria: null
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("ERROR CUENTA:", error);
        res.status(500).json({ msg: "Error al obtener cuenta" });
    }
};


/* =========================
   ACTUALIZAR
========================= */
export const updateEstudiante = async (req, res) => {
    const { id } = req.params;

    try {
        const {
            nombre,
            documento,
            telefono,
            direccion,
            email
        } = req.body;

        const result = await pool.query(
            `UPDATE estudiantes SET
                nombre = $1,
                documento = $2,
                telefono = $3,
                direccion = $4,
                email = $5
            WHERE id = $6
            RETURNING *`,
            [nombre, documento, telefono, direccion, email, id]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("ERROR ACTUALIZAR:", error);
        res.status(500).json({ error: error.message });
    }
};


/* =========================
   ELIMINAR
========================= */
export const deleteEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar cuenta financiera si existe
        await pool.query(`DELETE FROM cuentas_estudiante WHERE estudiante_id = $1`, [id]);

        // Eliminar estudiante
        const result = await pool.query(
            `DELETE FROM estudiantes WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "Estudiante no encontrado" });
        }

        res.json({ msg: "Estudiante eliminado correctamente" });

    } catch (error) {
        console.error("ERROR DELETE ESTUDIANTE:", error);
        res.status(500).json({ msg: "Error al eliminar estudiante" });
    }
};