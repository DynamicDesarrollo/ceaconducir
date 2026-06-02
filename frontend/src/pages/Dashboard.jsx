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
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;

  const [data, setData] = useState({
    estudiantes: [],
    totalEstudiantes: 0,
    pagos: [],
    egresos: [],
  });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

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
    chartEgresosData,
    pieData,
  } = useMemo(() => {
    const [selectedYearStr, selectedMonthStr] = (selectedMonth || currentMonth)
      .split("-");
    const anioSeleccionado = Number(selectedYearStr);
    const mesSeleccionado = Number(selectedMonthStr) - 1;

    // 👥 KPI
    const totalEstudiantes = data.totalEstudiantes;

    // 💰 PAGOS DEL MES
    const pagosMes = data.pagos.filter((p) => {
      const fecha = parseFecha(p.fecha);
      return (
        fecha &&
        fecha.getFullYear() === anioSeleccionado &&
        fecha.getMonth() === mesSeleccionado
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
        fecha.getFullYear() === anioSeleccionado &&
        fecha.getMonth() === mesSeleccionado
      );
    });

    const totalEgresosMes = egresosMes.reduce(
      (acc, e) => acc + Number(e.monto || 0),
      0
    );

    const balanceMes = totalPagosMes - totalEgresosMes;

    // 📊 EGRESOS POR MES DEL AÑO SELECCIONADO
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const egresosPorMes = new Array(12).fill(0);

    data.egresos.forEach((e) => {
      const fecha = parseFecha(e.fecha);
      if (!fecha || fecha.getFullYear() !== anioSeleccionado) return;
      egresosPorMes[fecha.getMonth()] += Number(e.monto || 0);
    });

    const chartEgresosData = monthNames.map((mes, idx) => ({
      mes,
      total: egresosPorMes[idx],
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
      chartEgresosData,
      pieData,
    };
  }, [data, selectedMonth, currentMonth]);

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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row sm:items-end gap-2">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Filtrar por mes</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setSelectedMonth(currentMonth)}
            className="h-[42px] rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Mes actual
          </button>
        </div>
      </div>

      {/* 🔹 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
          <h2 className="font-semibold mb-4">Egresos Mensuales</h2>

          {chartEgresosData.length === 0 ? (
            <p className="text-gray-400">No hay datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartEgresosData}>
                <XAxis dataKey="mes" />
                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="total"
                  fill="#ef4444"
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