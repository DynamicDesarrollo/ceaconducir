import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import axios from "axios";
// GET /api/matriculas/:id/contrato
async function generarContratoWord(req, res) {
    try {
        const { id } = req.params;
        // 1. Obtener datos completos de la matrícula
        const response = await axios.get(`${process.env.API_URL || "http://localhost:4000"}/api/matriculas/${id}/completa`);
        const data = response.data;

        // 2. Cargar plantilla Word
        const templatePath = path.resolve("templates/contrato_template.docx");
        const content = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(content);

        // 3. Configurar módulo de imágenes
        const imageOpts = {
            centered: false,
            getImage: function (tagValue) {
                if (!tagValue) return Buffer.from("");
                if (tagValue.startsWith("data:image")) {
                    return Buffer.from(tagValue.split(",")[1], "base64");
                }
                return axios.get(tagValue, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data));
            },
            getSize: function () {
                return [150, 80];
            },
        };
        const imageModule = new ImageModule(imageOpts);

        // 4. Renderizar documento
        const doc = new Docxtemplater(zip, { modules: [imageModule] });
        // Mapear valores legibles
        const tipoPersonaTxt = data.estudiante.tipo_persona === 'JURIDICA' ? 'Jurídica' : 'Natural';
        const pepTxt = data.estudiante.pep === 'SI' ? 'Sí' : 'No';
        let origenRecursosTxt = '';
        switch (data.estudiante.origen_recursos) {
            case 'SALARIO': origenRecursosTxt = 'Salario'; break;
            case 'HONORARIOS': origenRecursosTxt = 'Honorarios'; break;
            case 'INDEPENDIENTE': origenRecursosTxt = 'Independiente'; break;
            case 'PENSION': origenRecursosTxt = 'Pensión'; break;
            case 'AHORROS': origenRecursosTxt = 'Ahorros'; break;
            case 'OTROS': origenRecursosTxt = 'Otros'; break;
            default: origenRecursosTxt = data.estudiante.origen_recursos || '';
        }

        // Variables X para marcar en el contrato
        const x_natural = data.estudiante.tipo_persona === 'NATURAL' ? 'X' : '';
        const x_juridica = data.estudiante.tipo_persona === 'JURIDICA' ? 'X' : '';
        let pepValue = data.estudiante.pep;
        if (typeof pepValue === 'boolean') {
            pepValue = pepValue ? 'SI' : 'NO';
        } else {
            pepValue = (pepValue || '').toString().trim().toUpperCase();
            if (pepValue === 'TRUE') pepValue = 'SI';
            if (pepValue === 'FALSE') pepValue = 'NO';
        }
        const x_pep_si = pepValue === 'SI' ? 'X' : '';
        const x_pep_no = pepValue === 'NO' ? 'X' : '';
        const x_salario = data.estudiante.origen_recursos === 'SALARIO' ? 'X' : '';
        const x_honorarios = data.estudiante.origen_recursos === 'HONORARIOS' ? 'X' : '';
        const x_independiente = data.estudiante.origen_recursos === 'INDEPENDIENTE' ? 'X' : '';
        const x_pension = data.estudiante.origen_recursos === 'PENSION' ? 'X' : '';
        const x_ahorros = data.estudiante.origen_recursos === 'AHORROS' ? 'X' : '';
        const x_otros = data.estudiante.origen_recursos === 'OTROS' ? 'X' : '';

        // Variables X para tipo de trámite
        const tipoTramite = (data.matricula.tipo_tramite || '').toUpperCase();
        const x_licencia_i = tipoTramite === 'LICENCIA INICIAL' ? 'X' : '';
        const x_validacion_s = tipoTramite === 'VALIDACIÓN DE SABERES' || tipoTramite === 'VALIDACION DE SABERES' ? 'X' : '';
        const x_recategorizacion = tipoTramite === 'RECATEGORIZACIÓN' || tipoTramite === 'RECATEGORIZACION' ? 'X' : '';
        const categoriaNombre = (data.categoria.nombre || '').toUpperCase();
        const x_a1 = categoriaNombre.includes('A1') ? 'X' : '';
        const x_b1 = categoriaNombre.includes('B1') ? 'X' : '';
        const x_c1 = categoriaNombre.includes('C1') ? 'X' : '';

        // Separar fecha de creación en día, mes y año
        const separarFecha = (fecha) => {
            if (!fecha) return { dia: '', mes: '', anio: '' };
            const d = new Date(fecha);
            const dia = String(d.getDate()).padStart(2, '0');
            const mes = String(d.getMonth() + 1).padStart(2, '0');
            const anio = d.getFullYear();
            return { dia, mes, anio };
        };

        const { dia: d_c, mes: m_c, anio: a_c } = separarFecha(data.matricula.created_at);

        doc.render({
            nombre: data.estudiante.nombre,
            tipo_documento: data.estudiante.tipo_documento,
            documento: data.estudiante.documento,
            fecha_expedicion: data.estudiante.fecha_expedicion,
            telefono: data.estudiante.telefono,
            direccion: data.estudiante.direccion,
            email: data.estudiante.email,
            categoria: data.categoria.nombre,
            tramite: data.matricula.tipo_tramite,
            fecha: data.matricula.fecha_matricula,
            d_c,
            m_c,
            a_c,
            foto: data.estudiante.foto,
            firma: data.estudiante.firma,
            certificado_runt: data.matricula.certificado_runt,
            solicitud_runt: data.matricula.solicitud_runt,
            estado: data.matricula.estado,
            observaciones: data.matricula.observaciones,
            tipo_persona: tipoPersonaTxt,
            pep: pepTxt,
            origen_recursos: origenRecursosTxt,
            x_natural,
            x_juridica,
            x_pep_si,
            x_pep_no,
            x_salario,
            x_honorarios,
            x_independiente,
            x_pension,
            x_ahorros,
            x_otros,
            x_licencia_i,
            x_validacion_s,
            x_recategorizacion,
            x_a1,
            x_b1,
            x_c1,
        });

        const buf = doc.getZip().generate({ type: "nodebuffer" });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", `attachment; filename=contrato_matricula_${id}.docx`);
        res.send(buf);
    } catch (error) {
        console.error("ERROR GENERAR CONTRATO WORD:", error);
        res.status(500).json({ error: error.message });
    }
}
export { generarContratoWord };
// Obtener matrícula completa (matricula + estudiante + categoria + pagos)
export const getMatriculaCompleta = async (req, res) => {
    try {
        const { id } = req.params;
        // 1. Obtener matrícula
        const { rows: matriculaRows } = await pool.query(
            `SELECT * FROM matriculas WHERE id = $1`,
            [id]
        );
        if (!matriculaRows.length) return res.status(404).json({ error: "Matrícula no encontrada" });
        const matricula = matriculaRows[0];


        // 2. Obtener estudiante
        const { rows: estudianteRows } = await pool.query(
            `SELECT id, nombre, documento, telefono, direccion, email, fecha_expedicion, tipo_documento, ciudad, barrio, foto, firma, huella, created_at, tipo_persona, pep, origen_recursos FROM estudiantes WHERE id = $1`,
            [matricula.estudiante_id]
        );
        if (!estudianteRows.length) {
            console.error("Estudiante no encontrado para matrícula", id, "estudiante_id:", matricula.estudiante_id);
            return res.status(404).json({ error: "Estudiante no encontrado para esta matrícula" });
        }
        const estudiante = estudianteRows[0];

        // 3. Obtener categoría
        let categoria = null;

        if (matricula.es_combo) {

            const { rows: comboRows } = await pool.query(
                `SELECT id, nombre
     FROM combos
     WHERE id = $1`,
                [matricula.combo_id]
            );

            if (!comboRows.length) {
                return res.status(404).json({
                    error: "Combo no encontrado"
                });
            }

            categoria = comboRows[0];

        } else {

            const { rows: categoriaRows } = await pool.query(
                `SELECT id, nombre
     FROM categorias
     WHERE id = $1`,
                [matricula.categoria_id]
            );

            if (!categoriaRows.length) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            categoria = categoriaRows[0];
        }

        // 4. Obtener pagos (parche temporal: por estudiante)
        const { rows: pagos } = await pool.query(
            `SELECT id, monto, fecha FROM pagos WHERE estudiante_id = $1 ORDER BY fecha ASC`,
            [matricula.estudiante_id]
        );

        res.json({
            matricula,
            estudiante,
            categoria,
            pagos
        });
    } catch (error) {
        console.error("ERROR GET MATRICULA COMPLETA:", error);
        res.status(500).json({ error: error.message });
    }
};
import { pool } from "../config/db.js";

export const crearMatricula = async (req, res) => {
    try {
        const {
            estudiante_id,
            categoria_id,
            tipo_tramite,
            solicitud_runt,
            certificado_runt,
            observaciones
        } = req.body;

        const result = await pool.query(
            `INSERT INTO matriculas 
      (estudiante_id, categoria_id, tipo_tramite, solicitud_runt, certificado_runt, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
            [estudiante_id, categoria_id, tipo_tramite, solicitud_runt, certificado_runt, observaciones]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("ERROR CREAR MATRICULA:", error);
        res.status(500).json({ error: error.message });
    }
};
