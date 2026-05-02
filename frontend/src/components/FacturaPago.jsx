
import React, { forwardRef } from "react";
import logo from "../assets/logo.png";

const FacturaPago = forwardRef(({ pago, estudiante, cuenta, cursoNombre }, ref) => {
  const formatMoney = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  // Convertir monto a letras (simple)
  const numeroALetras = (num) => {
    // Solo para mostrar ejemplo, puedes mejorar con una librería
    return `${num}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " Pesos";
  };


  // Usar el valor histórico si existe
  const valorCurso = pago?.total_curso_historico ?? cuenta?.total_curso ?? 0;

  return (
    <div ref={ref} style={{ width: "19cm", height: "14cm", background: "#fff", fontFamily: 'Arial', border: '2px solid #2196f3', boxSizing: 'border-box', padding: 0, position: 'relative', margin: '24px auto' }}>
      {/* Encabezado con logo a la izquierda y datos a la derecha */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 24px 0 24px', borderBottom: "2px solid #2196f3", minHeight: 120 }}>
        {/* Logo a la izquierda */}
        <div style={{ flex: '0 0 120px', display: 'flex', alignItems: 'flex-start' }}>
          <img src={logo} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: 0 }} />
        </div>
        {/* Datos a la izquierda */}
        <div style={{ flex: 2, textAlign: 'left', paddingLeft: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>CEA CONDUCIR S.A.S.</div>
          <div style={{ fontSize: 13 }}>NIT: 901443965-1</div>
          <div style={{ fontSize: 13 }}>Calle 22 # 16-09 Calle Santander - Sincelejo</div>
          <div style={{ fontSize: 13 }}>Tel: 301 270 4886</div>
        </div>
        {/* Recibo de caja a la derecha */}
        <div style={{ flex: 1, textAlign: 'right', paddingLeft: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#2196f3', marginTop: 4 }}>RECIBO DE CAJA</div>
          <div style={{ fontSize: 13 }}>No. {pago?.consecutivo || "00001"}</div>
          <div style={{ fontSize: 13 }}>Fecha: {new Date(pago.fecha || Date.now()).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div style={{ background: "#e3f2fd", padding: 8, fontSize: 13, borderBottom: "1px solid #2196f3" }}>
        <b>CLIENTE:</b> {estudiante?.nombre || "-"} &nbsp;&nbsp;
        <b>NIT/C.C.:</b> {estudiante?.documento || "-"} &nbsp;&nbsp;
        <b>TELÉFONO:</b> {estudiante?.telefono || "-"} &nbsp;&nbsp;
        <b>CIUDAD:</b> Sincelejo
      </div>
      <div style={{ background: "#e3f2fd", padding: 8, fontSize: 13, borderBottom: "1px solid #2196f3" }}>
        <b>DIRECCIÓN:</b> {estudiante?.direccion || "-"}
      </div>
      <div style={{ background: "#fffde7", padding: 8, fontSize: 13, borderBottom: "2px solid #2196f3" }}>
        <b>CURSO:</b> {cursoNombre}
      </div>

      {/* Tabla de detalle */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#2196f3", color: "#fff" }}>
            <th style={{ border: "1px solid #2196f3", padding: 4 }}>CANT.</th>
            <th style={{ border: "1px solid #2196f3", padding: 4 }}>DESCRIPCIÓN</th>
            <th style={{ border: "1px solid #2196f3", padding: 4 }}>VR. UNI.</th>
            <th style={{ border: "1px solid #2196f3", padding: 4 }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #2196f3", padding: 4, textAlign: "center" }}>1</td>
            <td style={{ border: "1px solid #2196f3", padding: 4 }}>
              {pago.categoria || pago.combo || "Pago de curso"}
              <br />
              <span style={{ color: '#888', fontSize: 12 }}>Abono/Factura de pago</span>
            </td>
            <td style={{ border: "1px solid #2196f3", padding: 4, textAlign: "right" }}>{formatMoney(pago.monto)}</td>
            <td style={{ border: "1px solid #2196f3", padding: 4, textAlign: "right" }}>{formatMoney(pago.monto)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totales */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <table style={{ fontSize: 13, minWidth: 220 }}>
          <tbody>
            <tr>
              <td style={{ padding: 4, border: "1px solid #2196f3" }}>VALOR CURSO</td>
              <td style={{ padding: 4, border: "1px solid #2196f3", textAlign: "right" }}>{formatMoney(valorCurso)}</td>
            </tr>
            <tr>
              <td style={{ padding: 4, border: "1px solid #2196f3" }}>SUBTOTAL</td>
              <td style={{ padding: 4, border: "1px solid #2196f3", textAlign: "right" }}>{formatMoney(pago.monto)}</td>
            </tr>
            <tr>
              <td style={{ padding: 4, border: "1px solid #2196f3" }}>TOTAL PAGADO</td>
              <td style={{ padding: 4, border: "1px solid #2196f3", textAlign: "right" }}>
                {formatMoney(
                  Math.round((cuenta?.total_pagado || 0) + (pago?.monto || 0))
                )}
              </td>
            </tr>
            <tr>
              <td style={{ padding: 4, border: "1px solid #2196f3" }}>SALDO</td>
              <td style={{ padding: 4, border: "1px solid #2196f3", textAlign: "right" }}>{formatMoney(cuenta?.saldo)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Valor en letras */}
      <div style={{ margin: "8px 0 0 8px", fontSize: 12 }}>
        <b>Valor en letras:</b> {numeroALetras(pago.monto)}
      </div>

      {/* Firmas */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 8, padding: '0 16px', alignItems: 'flex-start', height: 40 }}>
        <div style={{ textAlign: "center", width: '40%' }}>
          <div style={{ borderTop: '1px solid #2196f3', margin: '4px 0 0 0', height: 16 }}>&nbsp;</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>FIRMA Y SELLO</div>
        </div>
        <div style={{ textAlign: "center", width: '40%' }}>
          <div style={{ borderTop: '1px solid #2196f3', margin: '4px 0 0 0', height: 16 }}>&nbsp;</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>RECIBIDO POR</div>
        </div>
      </div>

      {/* Pie de página */}
      <div style={{ position: "absolute", bottom: 8, left: 16, right: 16, fontSize: 10, color: '#888', textAlign: 'center' }}>
        Esta factura es solo para efectos de control interno. No es un documento válido para efectos fiscales.
      </div>
    </div>
  );
});

export default FacturaPago;
