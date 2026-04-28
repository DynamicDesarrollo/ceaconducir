import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";

export default function UsuarioForm({ onSuccess, renderFooter }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: "",
    empresa_id: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/usuarios", form);
      toast.success("Usuario creado");
      setForm({ nombre: "", email: "", password: "", rol_id: "", empresa_id: "" });
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Contraseña</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required className="input" />
      </div>
      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select name="rol_id" value={form.rol_id} onChange={handleChange} required className="input">
          <option value="">Seleccione...</option>
          <option value="1">ADMIN</option>
          <option value="2">USER</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Empresa (opcional)</label>
        <input name="empresa_id" value={form.empresa_id} onChange={handleChange} className="input" />
      </div>
      {renderFooter ? (
        renderFooter({
          onCancel: () => onSuccess && onSuccess(false),
          loading
        })
      ) : (
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Creando..." : "Crear Usuario"}
        </button>
      )}
    </form>
  );
}
