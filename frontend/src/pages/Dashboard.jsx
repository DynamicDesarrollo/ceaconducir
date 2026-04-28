import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({
    estudiantes: [],
    pagos: [],
    egresos: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res);
    } catch (e) {
      console.error("ERROR DASHBOARD", e);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalEstudiantes = data.estudiantes.length;


  // Mejor comparación de fechas: zona horaria local
  const hoy = new Date();
  const pagosHoy = data.pagos
    .filter((p) => {
      if (!p.fecha) return false;
      const fechaPago = new Date(p.fecha);
      return (
        fechaPago.getFullYear() === hoy.getFullYear() &&
        fechaPago.getMonth() === hoy.getMonth() &&
        fechaPago.getDate() === hoy.getDate()
      );
    })
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const totalEgresos = data.egresos.reduce(
    (acc, e) => acc + Number(e.monto || 0),
    0
  );

  const balance = pagosHoy - totalEgresos;

  // 📊 INGRESOS POR MES
  const ingresosPorMes = {};

  data.pagos.forEach((p) => {
    if (!p.fecha) return;

    const mes = p.fecha.slice(0, 7);

    if (!ingresosPorMes[mes]) ingresosPorMes[mes] = 0;

    ingresosPorMes[mes] += Number(p.monto || 0);
  });

  const chartData = Object.keys(ingresosPorMes).map((mes) => ({
    mes,
    total: ingresosPorMes[mes],
  }));

  // 🥧 TORTA
  const pieData = [
    { name: "Ingresos", value: pagosHoy },
    { name: "Egresos", value: totalEgresos },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 bg-blue-500 text-white rounded-xl shadow">
          <p>Estudiantes</p>
          <h2 className="text-3xl font-bold">{totalEstudiantes}</h2>
        </div>

        <div className="p-5 bg-green-500 text-white rounded-xl shadow">
          <p>Pagos hoy</p>
          <h2 className="text-3xl font-bold">
            ${pagosHoy.toLocaleString()}
          </h2>
        </div>

        <div className="p-5 bg-red-500 text-white rounded-xl shadow">
          <p>Egresos</p>
          <h2 className="text-3xl font-bold">
            ${totalEgresos.toLocaleString()}
          </h2>
        </div>

        <div className="p-5 bg-yellow-500 text-white rounded-xl shadow">
          <p>Balance</p>
          <h2 className="text-3xl font-bold">
            ${balance.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-2 gap-6">
        {/* 🥧 TORTA */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Distribución Financiera
          </h2>

          {pagosHoy === 0 && totalEgresos === 0 ? (
            <p className="text-gray-400">Sin datos</p>
          ) : (
            <PieChart width={300} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </div>

        {/* 📈 BARRAS */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Ingresos Mensuales
          </h2>

          {chartData.length === 0 ? (
            <p className="text-gray-400">No hay datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="mes" />
                <Tooltip />
                <Bar dataKey="total" fill="#facc15" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center text-gray-500">
          Cargando...
        </div>
      )}
    </div>
  );
}