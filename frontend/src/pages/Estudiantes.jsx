import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import FormEstudiante from "../components/FormEstudiante";
import { getEstudiantes, deleteEstudiante } from "../api/estudiantes";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import KPI from "../components/KPI";

export default function Estudiantes() {
    const columns = ["Nombre", "Documento", "Teléfono", "Direccion", "Email", "Estado"];

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔍 búsqueda con debounce
    const [q, setQ] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");

    const [page, setPage] = useState(1);
    const limit = 15;
    const [total, setTotal] = useState(0);

    // modal
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const totalEstudiantes = total;

    const pagados = data.filter(e => e.estado_pago === "Pagado").length;

    const pendientes = data.filter(e => e.estado_pago === "Pendiente").length;

    const [mes, setMes] = useState("");


    const deuda = data.reduce((acc, e) => {
        return acc + Number(e.saldo || 0);
    }, 0);

    // 🔥 debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQ(q);
        }, 400);

        return () => clearTimeout(t);
    }, [q]);

    // ✅ SOLO UN load (correcto)
    const load = useCallback(async () => {
        try {
            setLoading(true);

            const res = await getEstudiantes({
                q: debouncedQ,
                page,
                limit,
                mes
            });

            setData(res.data.data || res.data);
            setTotal(res.data.total || res.data.length || 0);
        } catch (e) {
            console.error(e);
            toast.error("Error cargando estudiantes");
        } finally {
            setLoading(false);
        }
    }, [debouncedQ, page, mes]);

    useEffect(() => {
        load();
    }, [load]);

    // 🔥 confirmación PRO
    const onDelete = async (row) => {
        const result = await Swal.fire({
            title: "¿Eliminar estudiante?",
            text: row.nombre,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e3342f",
            cancelButtonText: "Cancelar",
            confirmButtonText: "Sí, eliminar",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteEstudiante(row.id);
            toast.success("Estudiante eliminado");
            load();
        } catch (e) {
            toast.error("No se pudo eliminar");
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));




    console.log(data);
    return (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Estudiantes</h1>

                <button
                    onClick={() => {
                        setEditData(null);
                        setShowModal(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 transition px-4 py-2 rounded font-semibold shadow"
                >
                    + Nuevo Estudiante
                </button>
            </div>

            <select
                value={mes}
                onChange={(e) => {
                    setPage(1);
                    setMes(e.target.value);
                }}
                className="border p-2 rounded ml-2"
            >
                <option value="">Todos los meses</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
            </select>

            {/* 🔍 BUSCADOR */}
            <input
                placeholder="🔍 Buscar estudiante..."
                value={q}
                onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                }}
                className="w-full md:w-80 border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <div className="grid grid-cols-4 gap-4 mb-6">
                <KPI title="Total estudiantes" value={totalEstudiantes} />
                <KPI title="Pagados" value={pagados} color="green" />
                <KPI title="Pendientes" value={pendientes} color="yellow" />
                <KPI title="Deuda total" value={`$ ${deuda.toLocaleString()}`} color="red" />
            </div>
            {/* TABLA */}
            <Table
                columns={columns}
                data={data}
                search={q}

                renderRow={(e) => (
                    <>
                        <td>{e.nombre}</td>
                        <td>{e.documento}</td>
                        <td>{e.telefono}</td>

                        {/* 🔥 AQUÍ ESTÁ LA SOLUCIÓN */}
                        <td>{e.direccion || "-"}</td>
                        <td>{e.email || "-"}</td>

                        <td>
                            <span
                                className={`px-2 py-1 text-xs rounded font-semibold ${e.estado_pago === "Pagado"
                                    ? "bg-green-100 text-green-700"
                                    : e.estado_pago === "Pendiente"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {e.estado_pago}
                            </span>
                        </td>
                    </>
                )}

                renderActions={(row) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditData(row);
                                setShowModal(true);
                            }}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Editar
                        </button>

                        <button
                            onClick={() => onDelete(row)}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Eliminar
                        </button>
                    </div>
                )}
            />

            {/* 🔄 LOADING */}
            {loading && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="animate-spin h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
                        <p className="text-sm mt-2 text-center">Cargando...</p>
                    </div>
                </div>
            )}

            {/* 📭 EMPTY */}
            {!loading && data.length === 0 && (
                <div className="text-center p-6 text-gray-400">
                    No hay estudiantes registrados
                </div>
            )}

            {/* 📄 PAGINACIÓN */}
            <div className="flex justify-end items-center gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Anterior
                </button>

                <span className="text-sm">
                    Página {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            {/* MODAL */}
            {showModal && (
                <FormEstudiante
                    initialData={editData}
                    onClose={() => setShowModal(false)}
                    onSaved={load}
                />
            )}
        </div>
    );
}