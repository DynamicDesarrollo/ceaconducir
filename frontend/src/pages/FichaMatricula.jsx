import { useEffect, useState } from "react";
import { getFichaMatricula } from "../api/fichaMatricula";
import { useParams } from "react-router-dom";

export default function FichaMatricula() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getFichaMatricula(id);
        setData(res);
      } catch (err) {
        setError("No se pudo cargar la ficha");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Cargando ficha...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  const { estudiante, matricula, categoria, pagos } = data;
  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0);
  // valor_curso puede venir de categoria o matrícula según tu modelo
  const valorCurso = matricula.valor_curso || categoria?.valor || 0;
  const saldo = valorCurso - totalPagado;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-8 mt-8">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <h2 className="text-2xl font-bold">Ficha de Matrícula</h2>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
            onClick={() => window.print()}
          >
            Imprimir
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 print:hidden"
            onClick={() => {
              const url = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/matriculas/${id}/contrato`;
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `contrato_matricula_${id}.docx`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Generar contrato Word
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* DATOS ESTUDIANTE */}
        <div>
          <h3 className="font-semibold mb-2">Estudiante</h3>
          {estudiante.foto && (
            <img src={estudiante.foto} alt="Foto" className="w-32 h-32 object-cover rounded mb-2 border" />
          )}
          <div><b>Nombre:</b> {estudiante.nombre}</div>
          <div><b>Tipo de documento:</b> {estudiante.tipo_documento}</div>
          <div><b>Número:</b> {estudiante.documento}</div>
          <div><b>Fecha de Exp.:</b> {estudiante.fecha_expedicion ? estudiante.fecha_expedicion.slice(0,10) : ''}</div>
          <div><b>Teléfono:</b> {estudiante.telefono}</div>
          <div><b>Dirección:</b> {estudiante.direccion}</div>
          <div><b>Email:</b> {estudiante.email}</div>
          <div><b>Tipo de Persona:</b> {estudiante.tipo_persona === 'NATURAL' ? 'Natural' : 'Jurídica'}</div>
          <div><b>PEP:</b> {estudiante.pep === 'SI' ? 'Sí' : 'No'}</div>
          <div><b>Origen de Recursos:</b> {(() => {
            switch(estudiante.origen_recursos) {
              case 'SALARIO': return 'Salario';
              case 'HONORARIOS': return 'Honorarios';
              case 'INDEPENDIENTE': return 'Independiente';
              case 'PENSION': return 'Pensión';
              case 'AHORROS': return 'Ahorros';
              case 'OTROS': return 'Otros';
              default: return estudiante.origen_recursos;
            }
          })()}</div>
          {estudiante.firma && (
            <div className="mt-2"><b>Firma:</b><br /><img src={estudiante.firma} alt="Firma" className="h-12 object-contain border" /></div>
          )}
        </div>
        {/* DATOS MATRÍCULA */}
        <div>
          <h3 className="font-semibold mb-2">Matrícula</h3>
          <div><b>Categoría:</b> {categoria?.nombre}</div>
          <div><b>Trámite:</b> {matricula.tipo_tramite}</div>
          <div><b>Fecha:</b> {matricula.fecha_matricula?.slice(0,10)}</div>
          <div><b>Certificado RUNT:</b> {matricula.certificado_runt}</div>
          <div><b>Solicitud RUNT:</b> {matricula.solicitud_runt}</div>
          <div><b>Estado:</b> {matricula.estado}</div>
          {matricula.observaciones && <div><b>Obs.:</b> {matricula.observaciones}</div>}
        </div>
      </div>
      {/* ESTADO FINANCIERO */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Estado financiero</h3>
        <div><b>Valor curso:</b> ${valorCurso.toLocaleString()}</div>
        <div><b>Total pagado:</b> ${totalPagado.toLocaleString()}</div>
        <div><b>Saldo:</b> ${saldo.toLocaleString()}</div>
      </div>
      {/* PAGOS */}
      <div>
        <h3 className="font-semibold mb-2">Pagos</h3>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Monto</th>
              <th className="border px-2 py-1">Recibo</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 && (
              <tr><td colSpan={3} className="text-center py-2">Sin pagos</td></tr>
            )}
            {pagos.map(p => (
              <tr key={p.id}>
                <td className="border px-2 py-1">{p.fecha?.slice(0,10)}</td>
                <td className="border px-2 py-1">${Number(p.monto).toLocaleString()}</td>
                <td className="border px-2 py-1">{p.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
