import { useEffect, useState } from "react";
import { crearEstudiante, updateEstudiante } from "../api/estudiantes";
import { toast } from "react-toastify";

export default function FormEstudiante({ onClose, onSaved, initialData }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    direccion: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        documento: initialData.documento || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        email: initialData.email || "",
      });
    }
  }, [initialData]);

  // 🔒 Validaciones
  const soloNumeros = /^[0-9]+$/;
  const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "documento" || name === "telefono") {
      if (value && !soloNumeros.test(value)) return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const validar = () => {
    if (!form.nombre.trim()) return "Nombre obligatorio";
    if (!nombreRegex.test(form.nombre)) return "Nombre inválido";

    if (!form.documento.trim()) return "Documento obligatorio";
    if (!soloNumeros.test(form.documento)) return "Documento inválido";

    if (!form.telefono.trim()) return "Teléfono obligatorio";
    if (!soloNumeros.test(form.telefono)) return "Teléfono inválido";

    if (!form.direccion.trim()) return "Dirección obligatoria";

    if (!form.email.trim()) return "Email obligatorio";
    if (!emailRegex.test(form.email)) return "Email inválido";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validar();
    if (err) return toast.error(err);

    try {
      setLoading(true);

      if (isEdit) {
        await updateEstudiante(initialData.id, form);
        toast.success("Estudiante actualizado");
      } else {
        await crearEstudiante(form);
        toast.success("Estudiante creado");
      }

      onSaved();
      onClose();
    } catch (e2) {
      console.error(e2);
      toast.error(e2.response?.data?.error || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg animate-scaleIn">

        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Editar Estudiante" : "Nuevo Estudiante"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Nombre */}
          <input
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
          />

          {/* Documento */}
          <input
            name="documento"
            placeholder="Documento"
            value={form.documento}
            onChange={handleChange}
            inputMode="numeric"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
          />

          {/* Teléfono */}
          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            inputMode="numeric"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
          />

          {/* Dirección */}
          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
          />

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white transition ${
                loading
                  ? "bg-gray-400"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              {loading
                ? "Guardando..."
                : isEdit
                ? "Actualizar"
                : "Guardar"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}