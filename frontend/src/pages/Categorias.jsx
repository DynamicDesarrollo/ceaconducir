import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    getCategorias, crearCategoria, actualizarCategoria,
    eliminarCategoria
} from "../api/categorias";

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [editando, setEditando] = useState(null);
    const [eliminarId, setEliminarId] = useState(null);

    const [form, setForm] = useState({
        nombre: "",
        precio_total: "",
    });

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch {
            toast.error("Error cargando categorías");
        }
    };

    const guardar = async (e) => {
        e.preventDefault();

        try {

            if (editando) {

                await actualizarCategoria(
                    editando.id,
                    form
                );

                toast.success(
                    "Categoría actualizada"
                );

            } else {

                await crearCategoria(form);

                toast.success(
                    "Categoría creada"
                );

            }

            setForm({
                nombre: "",
                precio_total: "",
            });

            setEditando(null);
            setShowModal(false);

            cargar();

        } catch {

            toast.error(
                "Error guardando categoría"
            );

        }
    };

    const categoriasFiltradas = useMemo(() => {
        return categorias.filter((c) =>
            c.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [categorias, busqueda]);

    const totalCategorias = categorias.length;

    const valorMayor =
        categorias.length > 0
            ? Math.max(...categorias.map((c) => Number(c.precio_total)))
            : 0;

    const promedio =
        categorias.length > 0
            ? categorias.reduce(
                (acc, c) => acc + Number(c.precio_total),
                0
            ) / categorias.length
            : 0;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <h1 className="text-3xl font-bold">
                    Categorías
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow"
                >
                    {editando
                        ? "Editar Categoría"
                        : "Nueva Categoría"}
                </button>

            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-blue-50 p-5 rounded-xl shadow">
                    <p className="text-gray-500">
                        Total Categorías
                    </p>

                    <h2 className="text-3xl font-bold text-blue-600">
                        {totalCategorias}
                    </h2>
                </div>

                <div className="bg-green-50 p-5 rounded-xl shadow">
                    <p className="text-gray-500">
                        Valor Más Alto
                    </p>

                    <h2 className="text-2xl font-bold text-green-600">
                        ${valorMayor.toLocaleString()}
                    </h2>
                </div>

                <div className="bg-yellow-50 p-5 rounded-xl shadow">
                    <p className="text-gray-500">
                        Promedio
                    </p>

                    <h2 className="text-2xl font-bold text-yellow-600">
                        ${Math.round(promedio).toLocaleString()}
                    </h2>
                </div>

            </div>

            {/* BUSCADOR */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full md:w-80"
                />
            </div>

            {/* TABLA */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>
                            <th className="p-4 text-left">
                                Nombre
                            </th>

                            <th className="p-4 text-left">
                                Valor
                            </th>

                            <th className="p-4 text-center">
                                Acciones
                            </th>
                        </tr>

                    </thead>

                    <tbody>

                        {categoriasFiltradas.map((c) => (
                            <tr
                                key={c.id}
                                className="border-b hover:bg-slate-50 transition"
                            >
                                <td className="p-4 font-medium">
                                    {c.nombre}
                                </td>

                                <td className="p-4">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                        $
                                        {Number(
                                            c.precio_total
                                        ).toLocaleString()}
                                    </span>
                                </td>

                                <td className="p-4">

                                    <div className="flex justify-center gap-2">

                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                            onClick={() => {
                                                setEditando(c);

                                                setForm({
                                                    nombre: c.nombre,
                                                    precio_total: c.precio_total,
                                                });

                                                setShowModal(true);
                                            }}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                            onClick={() => {
                                                setEliminarId(c.id);
                                            }}
                                        >
                                            Eliminar
                                        </button>

                                    </div>

                                </td>
                            </tr>
                        ))}

                        {categoriasFiltradas.length === 0 && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="text-center p-6 text-gray-500"
                                >
                                    No se encontraron categorías
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

                    <form
                        onSubmit={guardar}
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                    >
                        <h2 className="text-2xl font-bold mb-5">
                            Nueva Categoría
                        </h2>

                        <input
                            placeholder="Nombre"
                            value={form.nombre}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    nombre: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg p-3 mb-4"
                        />

                        <input
                            type="number"
                            placeholder="Valor"
                            value={form.precio_total}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    precio_total: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg p-3 mb-4"
                        />

                        <div className="flex gap-3">

                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg w-full"
                            >
                                Guardar
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg w-full"
                            >
                                Cancelar
                            </button>

                        </div>

                    </form>

                </div>
            )}
            {eliminarId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-lg w-96">

                        <h2 className="text-xl font-bold mb-4">
                            Eliminar Categoría
                        </h2>

                        <p>
                            ¿Desea eliminar esta categoría?
                        </p>

                        <div className="flex gap-2 mt-6">

                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded w-full"
                                onClick={async () => {

                                    await eliminarCategoria(eliminarId);

                                    toast.success(
                                        "Categoría eliminada"
                                    );

                                    setEliminarId(null);

                                    cargar();
                                }}
                            >
                                Eliminar
                            </button>

                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded w-full"
                                onClick={() => setEliminarId(null)}
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}