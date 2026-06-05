// =========================
// CREAR ESTUDIANTE + MATRÍCULA (transacción)
// =========================
import { pool } from "../config/db.js";
const crearEstudianteConMatricula = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { estudiante, matricula } = req.body;
        // Crear estudiante SOLO con datos personales
        const resultEst = await client.query(
            `INSERT INTO estudiantes 
            (nombre, documento, telefono, direccion, email, fecha_expedicion, tipo_documento, ciudad, barrio, foto, firma, huella, tipo_persona, pep, origen_recursos, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())
            RETURNING *`,
            [
                estudiante.nombre,
                estudiante.documento,
                estudiante.telefono,
                estudiante.direccion,
                estudiante.email,
                estudiante.fecha_expedicion,
                estudiante.tipo_documento,
                estudiante.ciudad,
                estudiante.barrio,
                estudiante.foto,
                estudiante.firma,
                estudiante.huella,
                estudiante.tipo_persona,
                estudiante.pep,
                estudiante.origen_recursos
            ]
        );
        const estudianteCreado = resultEst.rows[0];
        // Crear matrícula
        // Obtener valor de la categoría
        const precioLista =
            Number(matricula.precio_lista || 0);

        const descuento =
            Number(matricula.descuento || 0);

        const valorCurso =
            Number(matricula.total_curso || 0);

        const esCombo = matricula.es_combo || false;
        const comboId = matricula.combo_id || null;

        const resultMat = await client.query(
            `
    INSERT INTO matriculas
(
    estudiante_id,
    categoria_id,
    combo_id,
    es_combo,

    tipo_tramite,
    solicitud_runt,
    certificado_runt,
    observaciones,
    fecha_matricula,

    precio_lista,
    descuento,

    total_curso,
    total_pagado,
    saldo,
    estado
)
    VALUES
(
    $1,$2,$3,$4,

    $5,$6,$7,$8,
    CURRENT_DATE,

    $9,
    $10,

    $11,
    0,
    $11,
    'ACTIVO'
)
    RETURNING *
    `,
            [
                estudianteCreado.id,

                matricula.categoria_id || null,
                comboId,
                esCombo,

                matricula.tipo_tramite,
                matricula.solicitud_runt,
                matricula.certificado_runt,
                matricula.observaciones || null,

                precioLista,
                descuento,

                valorCurso
            ]
        );
        await client.query('COMMIT');
        res.json({ estudiante: estudianteCreado, matricula: resultMat.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('ERROR CREAR ESTUDIANTE+MATRICULA:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};


/* =========================
   CREAR
========================= */
const crearEstudiante = async (req, res) => {
    try {

        const {
            nombre,
            documento,
            telefono,
            direccion,
            email,
            fecha_expedicion,
            tipo_documento,
            ciudad,
            barrio,
            foto,
            firma,
            huella,
            tipo_persona,
            pep,
            origen_recursos
        } = req.body;

        const result = await pool.query(
            `INSERT INTO estudiantes
            (
                nombre,
                documento,
                telefono,
                direccion,
                email,
                fecha_expedicion,
                tipo_documento,
                ciudad,
                barrio,
                foto,
                firma,
                huella,
                tipo_persona,
                pep,
                origen_recursos,
                created_at
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()
            )
            RETURNING *`,
            [
                nombre,
                documento,
                telefono,
                direccion,
                email,
                fecha_expedicion,
                tipo_documento,
                ciudad,
                barrio,
                foto,
                firma,
                huella,
                tipo_persona,
                pep,
                origen_recursos
            ]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error("ERROR CREAR ESTUDIANTE:", error);
        res.status(500).json({
            error: error.message
        });
    }
};
const getEstudiantes = async (req, res) => {
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
                -- matrícula más reciente (por fecha_matricula DESC)
                (
                  SELECT m.id FROM matriculas m
                  WHERE m.estudiante_id = e.id
                  ORDER BY m.fecha_matricula DESC, m.created_at DESC
                  LIMIT 1
                ) AS matricula_id,
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
const getCuentaEstudiante = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
    SELECT
        m.total_curso,
        m.total_pagado,
        m.saldo,

        m.categoria_id,
        m.combo_id,
        m.es_combo,

        m.tipo_tramite,

        c.nombre AS categoria,
        c.precio_total,

        co.nombre AS combo,
        co.precio_combo

    FROM matriculas m

    LEFT JOIN categorias c
        ON c.id = m.categoria_id

    LEFT JOIN combos co
        ON co.id = m.combo_id

    WHERE m.estudiante_id = $1
    ORDER BY m.fecha_matricula DESC
    LIMIT 1
`, [id]);

        if (result.rows.length === 0) {
            return res.json({
                total_curso: 0,
                total_pagado: 0,
                saldo: 0,
                categoria: null,
                combo: null
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("ERROR CUENTA:", error);
        res.status(500).json({
            msg: "Error al obtener cuenta"
        });
    }
};


const updateEstudiante = async (req, res) => {

    const client = await pool.connect();

    try {

        const { id } = req.params;

        const {
            nombre,
            documento,
            tipo_documento,
            fecha_expedicion,
            telefono,
            direccion,
            email,
            foto,
            firma,
            huella,
            tipo_persona,
            pep,
            origen_recursos,

            // MATRÍCULA
            matricula_id,
            categoria_id,
            combo_id,
            es_combo,
            tipo_tramite,
            solicitud_runt,
            certificado_runt,
            precio_lista,
            descuento,
            total_curso

        } = req.body;

        const fechaExpedicion =
            fecha_expedicion || null;

        // =====================
        // INICIAR TRANSACCIÓN
        // =====================

        await client.query("BEGIN");

        // =====================
        // ESTUDIANTE
        // =====================

        const result = await client.query(
            `
            UPDATE estudiantes
            SET
                nombre = $1,
                documento = $2,
                tipo_documento = $3,
                fecha_expedicion = $4,
                telefono = $5,
                direccion = $6,
                email = $7,
                foto = $8,
                firma = $9,
                huella = $10,
                tipo_persona = $11,
                pep = $12,
                origen_recursos = $13
            WHERE id = $14
            RETURNING *
            `,
            [
                nombre,
                documento,
                tipo_documento,
                fechaExpedicion,
                telefono,
                direccion,
                email,
                foto,
                firma,
                huella,
                tipo_persona,
                pep,
                origen_recursos,
                id
            ]
        );

        // =====================
        // MATRÍCULA
        // =====================
        // =====================
        // VALIDAR PAGOS
        // =====================

        // =====================
// VALIDAR PAGOS
// =====================

const pagosResult = await client.query(
`
SELECT COALESCE(SUM(monto),0) AS total_pagado
FROM pagos
WHERE estudiante_id = $1
`,
[id]
);

const totalPagado =
    Number(
        pagosResult.rows[0].total_pagado
    );

if (
    totalPagado > 0 &&
    matricula_id
) {

    const matriculaActual =
        await client.query(
            `
            SELECT
                categoria_id,
                combo_id,
                precio_lista
            FROM matriculas
            WHERE id = $1
            `,
            [matricula_id]
        );

    const actual =
        matriculaActual.rows[0];

    if (
        String(actual.categoria_id || "") !== String(categoria_id || "") ||
        String(actual.combo_id || "") !== String(combo_id || "")
    ) {

        throw new Error(
            `Este estudiante tiene pagos registrados por $${totalPagado.toLocaleString("es-CO")}. No es posible cambiar la categoría o combo.`
        );

    }
}


        if (matricula_id) {

            await client.query(
                `
                UPDATE matriculas
                SET
                    categoria_id = $1,
                    combo_id = $2,
                    es_combo = $3,
                    tipo_tramite = $4,
                    solicitud_runt = $5,
                    certificado_runt = $6,
                    precio_lista = $7,
                    descuento = $8,
                    total_curso = $9
                WHERE id = $10
                `,
                [
                    categoria_id,
                    combo_id,
                    es_combo,
                    tipo_tramite,
                    solicitud_runt,
                    certificado_runt,
                    precio_lista,
                    descuento,
                    total_curso,
                    matricula_id
                ]
            );

        }

        // =====================
        // CONFIRMAR
        // =====================

        await client.query("COMMIT");

        res.json(result.rows[0]);

    } catch (error) {

        // =====================
        // DESHACER TODO
        // =====================

        await client.query("ROLLBACK");

        console.error(
            "ERROR ACTUALIZAR:",
            error
        );

        res.status(500).json({
            error: error.message
        });

    } finally {

        client.release();

    }
};


/* =========================
   ELIMINAR
========================= */
const deleteEstudiante = async (req, res) => {
    const client = await pool.connect();

    try {

        const { id } = req.params;

        await client.query("BEGIN");

        // pagos
        await client.query(
            `DELETE FROM pagos
             WHERE estudiante_id = $1`,
            [id]
        );

        // cuenta financiera
        await client.query(
            `DELETE FROM cuentas_estudiante
             WHERE estudiante_id = $1`,
            [id]
        );

        // matrícula
        await client.query(
            `DELETE FROM matriculas
             WHERE estudiante_id = $1`,
            [id]
        );

        // estudiante
        const result = await client.query(
            `DELETE FROM estudiantes
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                msg: "Estudiante no encontrado"
            });
        }

        await client.query("COMMIT");

        res.json({
            msg: "Estudiante eliminado correctamente"
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "ERROR DELETE ESTUDIANTE:",
            error
        );

        res.status(500).json({
            msg: error.message
        });

    } finally {
        client.release();
    }
};
const getEstudianteCompleto = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                e.*,

                m.id AS matricula_id,
                m.categoria_id,
                m.combo_id,
                m.es_combo,

                m.tipo_tramite,
                m.solicitud_runt,
                m.certificado_runt,
                m.observaciones,

                m.precio_lista,
                m.descuento,
                m.total_curso,

                c.nombre AS categoria_nombre,
                co.nombre AS combo_nombre

            FROM estudiantes e

            LEFT JOIN matriculas m
                ON m.estudiante_id = e.id

            LEFT JOIN categorias c
                ON c.id = m.categoria_id

            LEFT JOIN combos co
                ON co.id = m.combo_id

            WHERE e.id = $1

            ORDER BY m.fecha_matricula DESC
            LIMIT 1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                msg: "Estudiante no encontrado"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error(
            "ERROR GET ESTUDIANTE COMPLETO:",
            error
        );

        res.status(500).json({
            msg: error.message
        });
    }
};
export {
    crearEstudianteConMatricula,
    crearEstudiante,
    getEstudiantes,
    getCuentaEstudiante,
    updateEstudiante,
    deleteEstudiante,
    getEstudianteCompleto,
};