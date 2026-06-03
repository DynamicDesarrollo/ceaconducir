import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import axios from "axios";

export const generarContratoWord = async (req, res) => {
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
        // tagValue puede ser base64 o url
        if (!tagValue) return Buffer.from("");
        if (tagValue.startsWith("data:image")) {
          return Buffer.from(tagValue.split(",")[1], "base64");
        }
        // Si es url, descargar
        return axios.get(tagValue, { responseType: "arraybuffer" }).then(r => Buffer.from(r.data));
      },
      getSize: function () {
        // Tamaño exacto del recuadro en Word: 2.89cm x 2.4cm
        // 1 cm ≈ 37.8 px
        const ancho = Math.round(2.89 * 37.8); // ≈ 109 px
        const alto = Math.round(2.4 * 37.8);   // ≈ 91 px
        return [ancho, alto];
      },
    };
    const imageModule = new ImageModule(imageOpts);

    // 4. Renderizar documento
    const doc = new Docxtemplater(zip, { modules: [imageModule] });
    
    // Separar fecha de creación en día, mes y año
    const separarFecha = (fecha) => {
      if (!fecha) return { dia: '', mes: '', anio: '' };
      const d = new Date(fecha);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const anio = d.getFullYear();
      return { dia, mes, anio };
    };
    
    const { dia: dia_contrato, mes: mes_contrato, anio: anio_contrato } = separarFecha(data.matricula.created_at);
    
    // Variables X para tipo de trámite
    const tipoTramite = (data.matricula.tipo_tramite || '').toUpperCase();
    const x_licencia_i = tipoTramite === 'LICENCIA INICIAL' ? 'X' : '';
    const x_validacion_s = tipoTramite === 'VALIDACIÓN DE SABERES' || tipoTramite === 'VALIDACION DE SABERES' ? 'X' : '';
    const x_recategorizacion = tipoTramite === 'RECATEGORIZACIÓN' || tipoTramite === 'RECATEGORIZACION' ? 'X' : '';
    const categoriaNombre = (data.categoria.nombre || '').toUpperCase();
    const x_a1 = categoriaNombre.includes('A1') ? 'X' : '';
    const x_b1 = categoriaNombre.includes('B1') ? 'X' : '';
    const x_c1 = categoriaNombre.includes('C1') ? 'X' : '';

    doc.render({
      nombre: data.estudiante.nombre,
      documento: data.estudiante.documento,
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
};
