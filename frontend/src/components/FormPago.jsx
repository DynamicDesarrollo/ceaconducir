import { useState, useEffect, useRef } from "react";
import FacturaPago from "./FacturaPago";
import { useReactToPrint } from "react-to-print";
import api from "../api/axios";
import { getCuentaEstudiante } from "../api/estudiantes";
import { toast } from "react-toastify";

export default function FormPago({ onClose, onSaved }) {
    // Estado para mostrar la factura
    const [showFactura, setShowFactura] = useState(false);
    const [facturaData, setFacturaData] = useState(null);
    const facturaRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => facturaRef.current,
    });

    const [estudiantes, setEstudiantes] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [combos, setCombos] = useState([]);

    const [openCat, setOpenCat] = useState(false);
    const [openCombo, setOpenCombo] = useState(false);

    const [newCat, setNewCat] = useState({ nombre: "", valor: "" });
    const [newCombo, setNewCombo] = useState({ nombre: "", precio: "" });

    const [search, setSearch] = useState("");
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [montoManual, setMontoManual] = useState("");

    const [cuenta, setCuenta] = useState(null);
    const [loadingCuenta, setLoadingCuenta] = useState(false);

    const tieneCurso = cuenta && cuenta.total_curso > 0;

    const [form, setForm] = useState({
        estudiante_id: "",
        es_combo: false,
        categoria_id: "",
        combo_id: ""
    });

    const [precio, setPrecio] = useState(0);

    // 🔄 cargar datos
    const loadData = async () => {
        try {
            const [est, cat, com] = await Promise.all([
                api.get("/estudiantes", { params: { limit: 10000 } }),
                api.get("/categorias"),
                api.get("/combos"),
            ]);

            setEstudiantes(est.data.data || []);
            setCategorias(cat.data || []);
            setCombos(com.data || []);
        } catch {
            toast.error("Error cargando datos");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 🔍 filtro estudiantes
    const filtered = estudiantes.filter(e =>
        (e.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.documento || "").toString().includes(search)
    );

    // 💰 precio automático
    useEffect(() => {
        if (form.es_combo && form.combo_id) {
            const combo = combos.find(c => c.id == form.combo_id);
            setPrecio(combo?.precio_combo || 0);
        } else if (!form.es_combo && form.categoria_id) {
            const cat = categorias.find(c => c.id == form.categoria_id);
            setPrecio(cat?.precio_total || 0);
        }
    }, [form, categorias, combos]);

   const totalFinal = montoManual
    ? Number(montoManual)
    : (cuenta?.saldo || precio);

    // 🔄 AUTOCARGAR CATEGORÍA
    useEffect(() => {
        if (cuenta) {
            setForm(prev => ({
                ...prev,
                categoria_id: cuenta.categoria_id || "",
                combo_id: cuenta.combo_id || "",
                es_combo: cuenta.es_combo || false
            }));
        }
    }, [cuenta]);

    // 💾 guardar pago
    const handleSubmit = async () => {
        if (totalFinal <= 0) return toast.error("Monto inválido");
        if (!tieneCurso && !form.categoria_id && !form.combo_id) {
            return toast.error("Selecciona categoría o combo");
        }
        let montoEnviar = totalFinal;
        if (cuenta?.saldo > 0 && totalFinal > cuenta.saldo) {
            montoEnviar = cuenta.saldo;
        }
        // Guardar pago y obtener datos para factura
        const res = await api.post("/pagos", {
            estudiante_id: form.estudiante_id,
            categoria_id: form.categoria_id,
            combo_id: form.combo_id,
            monto: montoEnviar
        });
        // Mostrar factura
        // Obtener el nombre del curso o combo seleccionado
        let cursoNombre = "-";
        if (form.es_combo && form.combo_id) {
            const comboSel = combos.find(c => c.id == form.combo_id);
            cursoNombre = comboSel ? `Combo: ${comboSel.nombre}` : "-";
        } else if (!form.es_combo && form.categoria_id) {
            const catSel = categorias.find(c => c.id == form.categoria_id);
            cursoNombre = catSel ? `Categoría: ${catSel.nombre}` : "-";
        }
        setFacturaData({
            pago: {
                ...res.data.pago,
                monto: montoEnviar,
                fecha: new Date().toISOString(),
                categoria: cuenta?.categoria,
                combo: cuenta?.combo
            },
            estudiante: selectedEstudiante,
            cuenta: {
                ...cuenta,
                total_pagado: res.data.resumen?.total_pagado ?? (cuenta?.total_pagado || 0) + montoEnviar,
                saldo: res.data.resumen?.saldo ?? (cuenta?.saldo || 0) - montoEnviar
            },
            cursoNombre
        });
        setShowFactura(true);
        toast.success("Pago registrado");
        onSaved();
    };

    // 👤 seleccionar estudiante
    const handleSelectEstudiante = async (estudiante) => {
        try {
            setLoadingCuenta(true);
            const res = await getCuentaEstudiante(estudiante.id);
            setCuenta(res.data);
        } catch {
            toast.error("Error al cargar cuenta");
        } finally {
            setLoadingCuenta(false);
        }
    };

    // ➕ CREAR CATEGORIA
    const crearCategoria = async () => {
        try {
            if (!newCat.nombre || !newCat.valor) {
                return toast.error("Completa los campos");
            }

            const res = await api.post("/categorias", {
                nombre: newCat.nombre,
                precio_total: newCat.valor
            });

            setCategorias(prev => [...prev, res.data]);

            setForm(prev => ({
                ...prev,
                categoria_id: res.data.id
            }));

            setNewCat({ nombre: "", valor: "" });
            setOpenCat(false);

            toast.success("Categoría creada");

        } catch {
            toast.error("Error creando categoría");
        }
    };

    // ➕ CREAR COMBO
    const crearCombo = async () => {
        try {
            if (!newCombo.nombre || !newCombo.precio) {
                return toast.error("Nombre y precio son obligatorios");
            }

            const res = await api.post("/combos", {
                nombre: newCombo.nombre,
                precio: Number(newCombo.precio),
            });

            setCombos(prev => [...prev, res.data]);

            setForm(prev => ({
                ...prev,
                combo_id: res.data.id,
                es_combo: true
            }));

            setOpenCombo(false);
            setNewCombo({ nombre: "", precio: "" });

            toast.success("Combo creado");

        } catch (error) {
            console.error("ERROR FRONT:", error.response?.data || error);
            toast.error("Error creando combo");
        }
    };
    const formatMoney = (value) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(value || 0);

    return (
        <>
            {/* MODAL FACTURA (fuera del flujo principal para evitar problemas de ciclo de vida) */}
            {showFactura && facturaData && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }}>
                    <div className="bg-white p-6 rounded-xl w-full max-w-2xl flex flex-col items-center" style={{ zIndex: 1001, pointerEvents: 'auto' }}>
                        <FacturaPago ref={facturaRef} {...facturaData} />
                        <div className="flex gap-4 mt-4">
                            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded" style={{ zIndex: 1100, pointerEvents: 'auto' }}>Imprimir</button>
                            <button onClick={handlePrint} className="bg-gray-600 text-white px-4 py-2 rounded" style={{ zIndex: 1100, pointerEvents: 'auto' }}>Expedir copia</button>
                            <button onClick={() => { setShowFactura(false); onClose(); }} className="border px-4 py-2 rounded" style={{ zIndex: 1100, pointerEvents: 'auto' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
            {!showFactura && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">

                        <h2 className="text-lg font-bold">Registrar Pago</h2>

                        <input
                            placeholder="Buscar estudiante..."
                            className="w-full border p-2 rounded"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                            <div className="border max-h-40 overflow-auto rounded">
                                {filtered.map(e => (
                                    <div
                                        key={e.id}
                                        onClick={() => {
                                            setSelectedEstudiante(e);
                                            setForm({ ...form, estudiante_id: e.id });
                                            setSearch(e.nombre);
                                            handleSelectEstudiante(e);
                                        }}
                                        className="p-2 cursor-pointer hover:bg-yellow-100"
                                    >
                                        {e.nombre}
                                    </div>
                                ))}
                            </div>
                        )}

                        {cuenta && (
                            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                                <div>
                                    <b>Curso:</b>{" "}
                                    {cuenta.categoria || cuenta.combo || "Sin asignar"}
                                </div>
                                <div><b>Total curso:</b> {formatMoney(cuenta.total_curso)}</div>
                                <div><b>Total pagado:</b> {formatMoney(cuenta.total_pagado)}</div>
                                <div><b>Saldo:</b>
                                    <span className={cuenta.saldo > 0 ? "text-red-600" : "text-green-600"}>
                                        {" "}{formatMoney(cuenta.saldo)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {!tieneCurso && (
                            <select
                                className="w-full border p-2 rounded"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        es_combo: e.target.value === "combo",
                                        categoria_id: "",
                                        combo_id: ""
                                    })
                                }
                            >
                                <option value="categoria">Categoría</option>
                                <option value="combo">Combo</option>
                            </select>
                        )}

                        {/* CATEGORIA */}
                        {!form.es_combo && !tieneCurso && (
                            <div className="flex gap-2">
                                <select
                                    className="w-full border p-2 rounded"
                                    value={form.categoria_id}
                                    onChange={(e) =>
                                        setForm({ ...form, categoria_id: e.target.value })
                                    }
                                >
                                    <option value="">Seleccione categoría</option>
                                    {categorias.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} - {formatMoney(c.precio_total)}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={() => setOpenCat(true)} className="bg-blue-500 text-white px-3 rounded">
                                    +
                                </button>
                            </div>
                        )}

                        {/* COMBO */}
                        {form.es_combo && (
                            <div className="flex gap-2">
                                <select
                                    className="w-full border p-2 rounded"
                                    value={form.combo_id}
                                    onChange={(e) =>
                                        setForm({ ...form, combo_id: e.target.value })
                                    }
                                >
                                    <option value="">Seleccione combo</option>
                                    {combos.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} - {formatMoney(c.precio_combo)}
                                        </option>
                                    ))}
                                </select>

                                <button onClick={() => setOpenCombo(true)} className="bg-blue-500 text-white px-3 rounded">
                                    +
                                </button>
                            </div>
                        )}

                        <input
                            type="number"
                            className="w-full border rounded px-3 py-2"
                            placeholder="Monto opcional"
                            value={montoManual}
                            onChange={(e) => setMontoManual(e.target.value)}
                        />

                        <div className="text-green-600 font-bold">
                            Total: {formatMoney(totalFinal)}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={onClose} className="border px-4 py-2 rounded">
                                Cancelar
                            </button>
                            <button onClick={handleSubmit} className="bg-yellow-500 px-4 py-2 rounded font-semibold">
                                Guardar
                            </button>
                        </div>
                    </div>

                    {/* MODAL CATEGORIA */}
                    {openCat && (
                        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                            <div className="bg-white p-5 rounded space-y-3 w-80">
                                <h3 className="font-bold">Nueva Categoría</h3>

                                <input
                                    className="w-full border p-2 rounded"
                                    placeholder="Nombre"
                                    value={newCat.nombre}
                                    onChange={e => setNewCat({ ...newCat, nombre: e.target.value })}
                                />

                                <input
                                    className="w-full border p-2 rounded"
                                    placeholder="Valor"
                                    type="number"
                                    value={newCat.valor}
                                    onChange={e => setNewCat({ ...newCat, valor: e.target.value })}
                                />

                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setOpenCat(false)}>Cancelar</button>
                                    <button onClick={crearCategoria} className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL COMBO */}
                    {openCombo && (
                        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                            <div className="bg-white p-5 rounded space-y-3 w-80">
                                <h3 className="font-bold">Nuevo Combo</h3>

                                <input
                                    placeholder="Nombre"
                                    value={newCombo.nombre}
                                    onChange={e =>
                                        setNewCombo({ ...newCombo, nombre: e.target.value })
                                    }
                                />

                                <input
                                    placeholder="Precio"
                                    type="number"
                                    value={newCombo.precio}
                                    onChange={e =>
                                        setNewCombo({ ...newCombo, precio: e.target.value })
                                    }
                                />

                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setOpenCombo(false)}>Cancelar</button>
                                    <button onClick={crearCombo} className="bg-blue-600 text-white px-4 py-2 rounded">
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}