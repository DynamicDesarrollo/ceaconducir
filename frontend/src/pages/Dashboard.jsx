import { useEffect, useState, useMemo } from "react";
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

  // 🔹 Formateador COP
  const formatMoney = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value || 0);

  // 🔹 Parse seguro de fechas (evita bug de zona horaria)
  const parseFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const [year, month, day] = fechaStr.split("T")[0].split("-");
    return new Date(year, month - 1, day);
  };

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

  // 🔥 OPTIMIZACIÓN: todo el cálculo en useMemo
  const {
    totalEstudiantes,
    totalPagosMes,
    totalEgresosMes,
    balanceMes,
    chartData,
    pieData,
  } = useMemo(() => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    // 👥 KPI
    const totalEstudiantes = data.estudiantes.length;

    // 💰 PAGOS DEL MES
    const pagosMes = data.pagos.filter((p) => {
      const fecha = parseFecha(p.fecha);
      return (
        fecha &&
        fecha.getFullYear() === anioActual &&
        fecha.getMonth() === mesActual
      );
    });

    const totalPagosMes = pagosMes.reduce(
      (acc, p) => acc + Number(p.monto || 0),
      0
    );

    // 💸 EGRESOS DEL MES
    const egresosMes = data.egresos.filter((e) => {
      const fecha = parseFecha(e.fecha);
      return (
        fecha &&
        fecha.getFullYear() === anioActual &&
        fecha.getMonth() === mesActual
      );
    });

    const totalEgresosMes = egresosMes.reduce(
      (acc, e) => acc + Number(e.monto || 0),
      0
    );

    const balanceMes = totalPagosMes - totalEgresosMes;

    // 📊 INGRESOS POR MES (para gráfica)
    const ingresosPorMes = {};

    data.pagos.forEach((p) => {
      if (!p.fecha) return;

      const fecha = parseFecha(p.fecha);
      if (!fecha) return;

      const key = `${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!ingresosPorMes[key]) ingresosPorMes[key] = 0;
      ingresosPorMes[key] += Number(p.monto || 0);
    });

    const chartData = Object.keys(ingresosPorMes).map((mes) => ({
      mes,
      total: ingresosPorMes[mes],
    }));

    // 🥧 PIE
    const pieData = [
      { name: "Ingresos", value: totalPagosMes },
      { name: "Egresos", value: totalEgresosMes },
    ];

    return {
      totalEstudiantes,
      totalPagosMes,
      totalEgresosMes,
      balanceMes,
      chartData,
      pieData,
    };
  }, [data]);

  const COLORS = ["#22c55e", "#ef4444"];

  // Tooltip bonito
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs border">
          <strong>{label}</strong>
          <br />
          {formatMoney(payload[0].value)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 🔹 KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 bg-blue-500 text-white rounded-xl shadow">
          <p>Estudiantes</p>
          <h2 className="text-3xl font-bold">{totalEstudiantes}</h2>
        </div>

        <div className="p-5 bg-green-500 text-white rounded-xl shadow">
          <p>Pagos mes</p>
          <h2 className="text-3xl font-bold">
            {formatMoney(totalPagosMes)}
          </h2>
        </div>

        <div className="p-5 bg-red-500 text-white rounded-xl shadow">
          <p>Egresos mes</p>
          <h2 className="text-3xl font-bold">
            {formatMoney(totalEgresosMes)}
          </h2>
        </div>

        <div className="p-5 bg-yellow-500 text-white rounded-xl shadow">
          <p>Balance mes</p>
          <h2 className="text-3xl font-bold">
            {formatMoney(balanceMes)}
          </h2>
        </div>
      </div>

      {/* 🔹 GRÁFICAS */}
      <div className="grid grid-cols-2 gap-6">
        {/* 🥧 PIE */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Distribución Financiera</h2>

          {totalPagosMes === 0 && totalEgresosMes === 0 ? (
            <p className="text-gray-400">Sin datos</p>
          ) : (
            <PieChart width={300} height={250}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ value }) => formatMoney(value)}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          )}
        </div>

        {/* 📊 BARRAS */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Ingresos Mensuales</h2>

          {chartData.length === 0 ? (
            <p className="text-gray-400">No hay datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="mes" />
                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="total"
                  fill="#facc15"
                  radius={[6, 6, 0, 0]}
                  label={{
                    position: "top",
                    formatter: formatMoney,
                  }}
                />
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