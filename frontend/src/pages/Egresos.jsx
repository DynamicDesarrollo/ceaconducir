import { useEffect, useState } from "react";
import Table from "../components/Table";
import api from "../api/axios";

export default function Egresos() {
  const [egresos, setEgresos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [terceros, setTerceros] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [openModalTercero, setOpenModalTercero] = useState(false);
  const [openModalVehiculo, setOpenModalVehiculo] = useState(false);

  const [form, setForm] = useState({
    categoria_id: "",
    tercero_id: "",
    vehiculo_id: "",
    valor: "",
    descripcion: "",
  });

  const [formTercero, setFormTercero] = useState({
    nombre: "",
    tipo: "proveedor",
    telefono: "",
    email: "",
  });

  const [formVehiculo, setFormVehiculo] = useState({
    placa: "",
    tipo: "",
    marca: "",
  });

  // =========================
  // FORMATOS
  // =========================
  const formatMoney = (value) =>
    `$ ${Number(value || 0).toLocaleString("es-CO")}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-CO");

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);

      const [
        egresosRes,
        categoriasRes,
        tercerosRes,
        vehiculosRes
      ] = await Promise.all([
        api.get("/egresos"),
        api.get("/egresos/categorias"),
        api.get("/terceros"),
        api.get("/vehiculos"),
      ]);

      setEgresos(egresosRes.data);
      setCategorias(categoriasRes.data);
      setTerceros(tercerosRes.data);
      setVehiculos(vehiculosRes.data);

    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // TOTAL
  // =========================
  const total = egresos.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  );

  // =========================
  // CREAR EGRESO
  // =========================
  const handleSubmit = async () => {
    if (!form.categoria_id || !form.valor) {
      return alert("Categoría y valor son obligatorios");
    }

    try {
      await api.post("/egresos", form);

      setShowModal(false);

      setForm({
        categoria_id: "",
        tercero_id: "",
        vehiculo_id: "",
        valor: "",
        descripcion: "",
      });

      loadData();
    } catch (error) {
      alert(error.response?.data?.msg || "Error al guardar egreso");
    }
  };

  // =========================
  // CREAR TERCERO
  // =========================
  const crearTercero = async () => {
    try {
      if (!formTercero.nombre) {
        return alert("Nombre obligatorio");
      }

      const res = await api.post("/terceros", formTercero);

      const nuevos = await api.get("/terceros");
      setTerceros(nuevos.data);

      setForm({ ...form, tercero_id: res.data.id });

      setOpenModalTercero(false);

      setFormTercero({
        nombre: "",
        tipo: "proveedor",
        telefono: "",
        email: "",
      });

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CREAR VEHICULO
  // =========================
  const crearVehiculo = async () => {
    try {
      if (!formVehiculo.placa) {
        return alert("La placa es obligatoria");
      }

      const res = await api.post("/vehiculos", formVehiculo);

      const nuevos = await api.get("/vehiculos");
      setVehiculos(nuevos.data);

      setForm({ ...form, vehiculo_id: res.data.id });

      setOpenModalVehiculo(false);

      setFormVehiculo({
        placa: "",
        tipo: "",
        marca: "",
      });

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // COLUMNAS
  // =========================
  const columns = [
    {
      title: "Concepto",
      render: (row) => row.descripcion || "Sin descripción",
    },
    {
      title: "Tercero",
      render: (row) => row.tercero || "-",
    },
    {
      title: "Vehículo",
      render: (row) => row.vehiculo || "-",
    },
    {
      title: "Valor",
      render: (row) => (
        <span className="text-red-600 font-bold">
          {formatMoney(row.monto)}
        </span>
      ),
    },
    {
      title: "Fecha",
      render: (row) => formatDate(row.fecha),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Egresos</h1>

      {/* TOTAL */}
      <div className="flex justify-between bg-white p-4 rounded-xl shadow">
        <p>Total egresos</p>
        <p className="text-red-600 font-bold">
          {formatMoney(total)}
        </p>
      </div>

      {/* BOTÓN */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          + Nuevo Egreso
        </button>
      </div>

      {/* TABLA */}
      {loading ? (
        <p className="text-center text-gray-400">Cargando...</p>
      ) : (
        <Table columns={columns} data={egresos} />
      )}

      {/* ================= MODAL EGRESO ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

            <h2 className="font-bold">Nuevo Egreso</h2>

            {/* CATEGORIA */}
            <select
              className="w-full border p-2 rounded"
              value={form.categoria_id}
              onChange={(e) =>
                setForm({ ...form, categoria_id: e.target.value })
              }
            >
              <option value="">Seleccione categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            {/* TERCERO */}
            <div className="flex gap-2">
              <select
                className="w-full border p-2 rounded"
                value={form.tercero_id}
                onChange={(e) =>
                  setForm({ ...form, tercero_id: e.target.value })
                }
              >
                <option value="">Seleccione tercero</option>
                {terceros.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setOpenModalTercero(true)}
                className="bg-blue-500 text-white px-3 rounded"
              >
                +
              </button>
            </div>

            {/* VEHICULO */}
            <div className="flex gap-2">
              <select
                className="w-full border p-2 rounded"
                value={form.vehiculo_id}
                onChange={(e) =>
                  setForm({ ...form, vehiculo_id: e.target.value })
                }
              >
                <option value="">Seleccione vehículo</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.marca}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setOpenModalVehiculo(true)}
                className="bg-blue-500 text-white px-3 rounded"
              >
                +
              </button>
            </div>

            <input
              placeholder="Descripción"
              className="w-full border p-2 rounded"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />

            <input
              placeholder="Valor"
              type="number"
              className="w-full border p-2 rounded"
              value={form.valor}
              onChange={(e) =>
                setForm({ ...form, valor: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL VEHICULO ================= */}
      {openModalVehiculo && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-3">

            <h2 className="font-bold">Nuevo Vehículo</h2>

            <input
              placeholder="Placa"
              value={formVehiculo.placa}
              onChange={(e) =>
                setFormVehiculo({
                  ...formVehiculo,
                  placa: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="Marca"
              value={formVehiculo.marca}
              onChange={(e) =>
                setFormVehiculo({
                  ...formVehiculo,
                  marca: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="Tipo"
              value={formVehiculo.tipo}
              onChange={(e) =>
                setFormVehiculo({
                  ...formVehiculo,
                  tipo: e.target.value,
                })
              }
              className="w-full border p-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpenModalVehiculo(false)}>
                Cancelar
              </button>

              <button
                onClick={crearVehiculo}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}