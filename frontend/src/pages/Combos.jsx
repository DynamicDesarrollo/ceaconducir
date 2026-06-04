import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    getCombos, crearCombo, actualizarCombo,
    eliminarCombo
} from "../api/combos";

export default function Combos() {
    const [combos, setCombos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [editando, setEditando] = useState(null);
    const [eliminarId, setEliminarId] = useState(null);

    const [form, setForm] = useState({
        nombre: "",
        precio: "",
    });

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        try {
            const data = await getCombos();
            setCombos(data);
        } catch {
            toast.error("Error cargando combos");
        }
    };

    const guardar = async (e) => {
        e.preventDefault();

        try {

            if (editando) {

                await actualizarCombo(
                    editando.id,
                    form
                );

                toast.success(
                    "Combo actualizado"
                );

            } else {

                await crearCombo(form);

                toast.success(
                    "Combo creado"
                );

            }

            setForm({
                nombre: "",
                precio: "",
            });

            setEditando(null);
            setShowModal(false);

            cargar();

        } catch {

            toast.error(
                "Error guardando combo"
            );

        }
    };

    const combosFiltrados = useMemo(() => {
        return combos.filter((c) =>
            c.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [combos, busqueda]);

    const totalCombos = combos.length;

    const valorMayor =
        combos.length > 0
            ? Math.max(...combos.map((c) => Number(c.precio_combo)))
            : 0;

    const promedio =
        combos.length > 0
            ? combos.reduce(
                (acc, c) => acc + Number(c.precio_combo),
                0
            ) / combos.length
            : 0;

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">

                <h1 className="text-3xl font-bold">
                    Combos
                </h1>

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg shadow"
                >
                    + Nuevo Combo
                </button>

            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-blue-50 p-5 rounded-xl shadow">
                    <p className="text-gray-500">
                        Total Combos
                    </p>

                    <h2 className="text-3xl font-bold text-blue-600">
                        {totalCombos}
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
                    placeholder="Buscar combo..."
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

                        {combosFiltrados.map((combo) => (
                            <tr
                                key={combo.id}
                                className="border-b hover:bg-slate-50 transition"
                            >
                                <td className="p-4 font-medium">
                                    {combo.nombre}
                                </td>

                                <td className="p-4">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                                        $
                                        {Number(
                                            combo.precio_combo
                                        ).toLocaleString()}
                                    </span>
                                </td>

                                <td className="p-4">

                                    <div className="flex justify-center gap-2">

                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                            onClick={() => {
                                                setEditando(combo);

                                                setForm({
                                                    nombre: combo.nombre,
                                                    precio: combo.precio_combo,
                                                });

                                                setShowModal(true);
                                            }}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                            onClick={() => setEliminarId(combo.id)}
                                        >
                                            Eliminar
                                        </button>

                                    </div>

                                </td>
                            </tr>
                        ))}

                        {combosFiltrados.length === 0 && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="text-center p-6 text-gray-500"
                                >
                                    No se encontraron combos
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
                            {editando ? "Editar Combo" : "Nuevo Combo"}
                        </h2>

                        <input
                            placeholder="Nombre del combo"
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
                            value={form.precio}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    precio: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg p-3 mb-4"
                        />

                        <div className="flex gap-3">

                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg w-full"
                            >
                                {editando ? "Actualizar" : "Guardar"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditando(null);

                                    setForm({
                                        nombre: "",
                                        precio: "",
                                    });
                                }}
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

                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">

                        <h2 className="text-xl font-bold mb-4">
                            Eliminar Combo
                        </h2>

                        <p className="mb-6">
                            ¿Desea eliminar este combo?
                        </p>

                        <div className="flex gap-3">

                            <button
                                className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg w-full"
                                onClick={async () => {

                                    try {

                                        await eliminarCombo(eliminarId);

                                        toast.success(
                                            "Combo eliminado"
                                        );

                                        setEliminarId(null);

                                        cargar();

                                    } catch {

                                        toast.error(
                                            "Error eliminando combo"
                                        );

                                    }

                                }}
                            >
                                Eliminar
                            </button>

                            <button
                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg w-full"
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