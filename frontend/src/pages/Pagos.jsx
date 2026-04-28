import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import FormPago from "../components/FormPago";
import { getPagos } from "../api/pagos";
import api from "../api/axios";


export default function Pagos() {

    const [pagos, setPagos] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [combos, setCombos] = useState([]);

    const [search, setSearch] = useState("");
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");

    const [open, setOpen] = useState(false);

    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const [historial, setHistorial] = useState([]);


    const handleEditar = (pago) => {
        setPagoSeleccionado(pago);
        setOpen(true); // reutiliza el modal de FormPago
    };

    const handleEliminar = async (id) => {
        try {
            const confirmar = window.confirm("¿Eliminar este pago?");
            if (!confirmar) return;

            await axios.delete(`http://localhost:4000/api/pagos/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            toast.success("Pago eliminado 🗑️");

            obtenerPagos(); // 🔥 refresca tabla

        } catch (error) {
            console.error(error);
            toast.error("Error al eliminar ❌");
        }
    };


    // 🔄 cargar datos
    const loadData = async () => {
        const res = await getPagos();
        setPagos(res.data);
        setFiltered(res.data);
    };

    useEffect(() => {
        loadData();
    }, []);

    // 🔍 filtros
    useEffect(() => {
        let data = [...pagos];

        if (search) {
            data = data.filter(p =>
                p.estudiante?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (desde) {
            data = data.filter(p => new Date(p.fecha) >= new Date(desde));
        }

        if (hasta) {
            data = data.filter(p => new Date(p.fecha) <= new Date(hasta));
        }

        setFiltered(data);
    }, [search, desde, hasta, pagos]);

    // 💰 formato
    const formatMoney = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value);

    const total = filtered.reduce((acc, p) => acc + Number(p.monto), 0);

    // 🧠 estado financiero (simulado por ahora)
    const getEstado = (monto) => {
        if (monto >= 800000) return "AL DÍA";
        return "DEBE";
    };

    const loadHistorial = async (id) => {
        const res = await fetch(`http://localhost:4000/api/pagos/historial/${id}`);
        const data = await res.json();
        setHistorial(data);
    };

    const verDetalle = async (pago) => {
        try {
            const res = await api.get(`/pagos/estudiante/${pago.estudiante_id}`);

            if (import.meta.env.DEV) {
                console.log("RESPUESTA:", res.data);
            }

            if (!res.data || !res.data.estudiante) {
                console.error("No viene estudiante");
                return;
            }

            setPagoSeleccionado({
                ...res.data.estudiante,
                estudiante: res.data.estudiante.nombre
            });

            setHistorial(res.data.historial || []);

            setOpenModal(true);

        } catch (err) {
            console.error("ERROR:", err);
        }
    };

    const getEstadoCurso = (row) => {
        const total = Number(row.total_curso || 0);
        const pagado = Number(row.total_pagado || 0);

        if (!total) {
            return { label: "Sin curso", color: "gray" };
        }

        const porcentaje = (pagado / total) * 100;

        if (porcentaje >= 100) {
            return { label: "Pagado", color: "green" };
        }

        if (porcentaje > 0) {
            return { label: `En proceso (${Math.round(porcentaje)}%)`, color: "yellow" };
        }

        return { label: "Pendiente", color: "red" };
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Intl.DateTimeFormat("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(date));
    };
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const res = await api.get("/combos");
                setCombos(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCombos();
    }, []);
    console.log("COMBOS 👉", pagos);
    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Ingresos</h2>
                <p className="text-gray-500">Control financiero del sistema</p>

                <button
                    onClick={() => setOpen(true)}
                    className="bg-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
                >
                    + Nuevo ingreso
                </button>
            </div>

            {/* FILTROS */}
            <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-3 items-center">

                <div className="flex items-center border rounded px-3 py-2 w-60">
                    <Search size={16} className="text-gray-400" />
                    <input
                        placeholder="Buscar estudiante..."
                        className="ml-2 outline-none w-full text-sm"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <input type="date" className="border rounded px-3 py-2 text-sm"
                    onChange={(e) => setDesde(e.target.value)} />

                <input type="date" className="border rounded px-3 py-2 text-sm"
                    onChange={(e) => setHasta(e.target.value)} />

                <div className="ml-auto font-semibold text-green-600">
                    Total: {formatMoney(total)}
                </div>
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-auto max-h-[500px]">

                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th>Estudiante</th>
                                <th>Categoría</th>
                                <th>Combo</th>
                                <th>Monto</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagos.map((row) => {
                                const estado = getEstadoCurso(row);

                                return (
                                    <tr key={row.id} className="border-t">

                                        <td>{formatDate(row.fecha)}</td>

                                        <td>{row.estudiante}</td>

                                        <td>{row.categoria || "-"}</td>

                                        <td>{row.combo || "-"}</td>

                                        <td className="text-green-600 font-semibold text-right">
                                            ${new Intl.NumberFormat("es-CO").format(row.monto)}
                                        </td>

                                        {/* 🔥 ESTADO PRO */}
                                        <td>
                                            <div className="space-y-1 align-center">

                                                {/* etiqueta */}
                                                <span className={`px-2 py-1 rounded text-white text-xs font-semibold align-center
                        ${estado.color === "green" && "bg-green-500"}
                        ${estado.color === "yellow" && "bg-yellow-500"}
                        ${estado.color === "red" && "bg-red-500"}
                        ${estado.color === "gray" && "bg-gray-400"}
                    `}>
                                                    {estado.label}
                                                </span>

                                                {/* barra progreso */}
                                                {estado.porcentaje > 0 && (
                                                    <div className="w-full bg-gray-200 h-2 rounded">
                                                        <div
                                                            className="bg-green-500 h-2 rounded"
                                                            style={{ width: `${estado.porcentaje}%` }}
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        </td>

                                        <td className="text-left">
                                            <div className="flex gap-2">

                                                {/* VER */}
                                                <button
                                                    onClick={() => verDetalle(row)}
                                                    className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                                                >
                                                    👁 Ver Pagos
                                                </button>

                                                {/* EDITAR */}
                                                <button
                                                    onClick={() => handleEditar(row)}
                                                    className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs hover:bg-yellow-200"
                                                >
                                                    ✏️ Editar
                                                </button>

                                                {/* ELIMINAR */}
                                                <button
                                                    onClick={() => handleEliminar(row.id)}
                                                    className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200"
                                                >
                                                    🗑 Eliminar
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>

                        <tfoot className="bg-slate-50">
                            <tr>
                                <td colSpan="4" className="p-3 text-right font-semibold">
                                    TOTAL
                                </td>
                                <td className="font-bold text-green-600">
                                    {formatMoney(total)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>

                </div>
            </div>

            {/* FORM */}
            {open && (
                <FormPago
                    onClose={() => setOpen(false)}
                    onSaved={loadData}
                />
            )}

            {/* 🔥 MODAL PRO */}
            {openModal && pagoSeleccionado && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-[500px] shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2 className="text-xl font-bold mb-4">
                            📊 Estado Financiero
                        </h2>

                        <div className="space-y-3 text-sm">

                            <p><b>Estudiante:</b> {pagoSeleccionado.nombre}</p>

                            <p><b>Valor Curso:</b>
                                <span className="ml-2 font-semibold">
                                    ${Number(pagoSeleccionado.total_curso || 0).toLocaleString()}
                                </span>
                            </p>

                            <p><b>Total Pagado:</b>
                                <span className="text-green-600 ml-2 font-bold">
                                    ${Number(pagoSeleccionado.total_pagado || 0).toLocaleString()}
                                </span>
                            </p>

                            <p><b>Saldo:</b>
                                <span className="text-red-500 ml-2 font-bold">
                                    ${Number(pagoSeleccionado.saldo || 0).toLocaleString()}
                                </span>
                            </p>

                            {/* 🟢 ESTADO */}
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${pagoSeleccionado.estado_pago === "Pagado"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {pagoSeleccionado.estado_pago}
                                </span>
                            </div>

                            {/* 📊 PROGRESO */}
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 h-3 rounded-full">
                                    <div
                                        className="bg-green-500 h-3 rounded-full"
                                        style={{
                                            width: `${pagoSeleccionado.total_curso > 0
                                                ? (pagoSeleccionado.total_pagado / pagoSeleccionado.total_curso) * 100
                                                : 0
                                                }%`
                                        }}
                                    />
                                </div>

                                <p className="text-xs mt-1 text-gray-600">
                                    {Math.round(
                                        (pagoSeleccionado.total_pagado / pagoSeleccionado.total_curso) * 100
                                    ) || 0}% pagado
                                </p>
                            </div>

                            {/* 📚 HISTORIAL */}
                            <div className="mt-4">
                                <p className="font-semibold mb-2">📚 Historial de pagos</p>

                                <div className="max-h-[200px] overflow-auto border rounded">

                                    {historial.length === 0 && (
                                        <p className="p-3 text-gray-400 text-center">
                                            Sin pagos registrados
                                        </p>
                                    )}

                                    {historial.map((h, i) => (
                                        <div key={i} className="flex justify-between px-3 py-2 border-b text-xs">
                                            <span>{new Date(h.fecha).toLocaleDateString()}</span>
                                            <span>${Number(h.monto).toLocaleString()}</span>
                                        </div>
                                    ))}

                                </div>
                            </div>

                        </div>
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="bg-gray-200 px-4 py-2 rounded"
                            >
                                Cerrar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}