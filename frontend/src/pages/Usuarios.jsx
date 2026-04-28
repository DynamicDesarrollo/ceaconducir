
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import UsuarioForm from "../components/UsuarioForm";

import { useAuth } from "../context/AuthContext";

function EditarUsuarioForm({ usuario, onSuccess }) {
  const [form, setForm] = useState({ ...usuario, password: "" });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/usuarios/${usuario.id}`, form);
      toast.success("Usuario actualizado");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.rol === "ADMIN" || user?.rol_id === 1 || user?.rol === 1;

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
      {isAdmin && (
        <div>
          <label className="block text-sm font-medium">Contraseña (dejar vacío para no cambiar)</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="input" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium">Rol</label>
        <select name="rol_id" value={form.rol_id} onChange={handleChange} required className="input">
          <option value="">Seleccione...</option>
          <option value="1">ADMIN</option>
          <option value="2">USER</option>
        </select>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded shadow w-full"
          disabled={loading}
        >{loading ? "Guardando..." : "Guardar Cambios"}</button>
        <button
          type="button"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded shadow w-full"
          onClick={() => onSuccess && onSuccess(false)}
          disabled={loading}
        >Cancelar</button>
      </div>
    </form>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const { data } = await axios.get("/usuarios");
      setUsuarios(data);
    } catch (err) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  async function eliminarUsuario(id) {
    setDeleting(true);
    try {
      await axios.delete(`/usuarios/${id}`);
      toast.success("Usuario eliminado");
      setDeleteUser(null);
      cargarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Crear Usuario
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Rol</th>
              <th className="py-2 px-4">Activo</th>
              {/* <th className="py-2 px-4">Empresa</th> */}
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="py-2 px-4">{u.nombre}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.rol}</td>
                <td className="py-2 px-4">{u.activo ? "Sí" : "No"}</td>
                {/* <td className="py-2 px-4">{u.empresa_id || "-"}</td> */}
                <td className="py-2 px-4 flex gap-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded shadow transition-colors"
                    onClick={() => setEditUser(u)}
                  >Editar</button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow transition-colors"
                    onClick={() => setDeleteUser(u)}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Crear */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >✕</button>
            <h2 className="text-xl font-bold p-4 pb-0">Crear Usuario</h2>
            <UsuarioForm
              onSuccess={() => {
                setShowModal(false);
                cargarUsuarios();
              }}
              renderFooter={({ onCancel, loading }) => (
                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded shadow w-full"
                    disabled={loading}
                  >{loading ? "Creando..." : "Crear Usuario"}</button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded shadow w-full"
                    onClick={onCancel}
                    disabled={loading}
                  >Cancelar</button>
                </div>
              )}
            />
          </div>
        </div>
      )}
      {/* Modal Editar */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setEditUser(null)}
            >✕</button>
            <h2 className="text-xl font-bold p-4 pb-0">Editar Usuario</h2>
            <EditarUsuarioForm
              usuario={editUser}
              onSuccess={(ok) => {
                setEditUser(null);
                if (ok !== false) cargarUsuarios();
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-sm relative p-6">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setDeleteUser(null)}
            >✕</button>
            <h2 className="text-xl font-bold mb-4">Eliminar Usuario</h2>
            <p>¿Seguro que deseas eliminar a <b>{deleteUser.nombre}</b>?</p>
            <div className="flex gap-2 mt-6">
              <button
                className="btn btn-danger flex-1"
                onClick={() => eliminarUsuario(deleteUser.id)}
                disabled={deleting}
              >{deleting ? "Eliminando..." : "Eliminar"}</button>
              <button
                className="btn flex-1"
                onClick={() => setDeleteUser(null)}
                disabled={deleting}
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
