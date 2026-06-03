import api from "./axios";

/**
 * 📌 Obtener estudiantes con paginación y búsqueda
 */
export const getEstudiantes = (params = {}) => {
  return api.get("/estudiantes", {
    params: {
      q: params.q || "",
      page: params.page || 1,
      limit: params.limit || 5,
      mes: params.mes || "",     // 🔥 AQUÍ
      anio: params.anio || "",   // 🔥 OPCIONAL (recomendado)
    },
  });
};

/**
 * 📌 Crear estudiante
 */
export const crearEstudiante = (data) => {
  return api.post("/estudiantes", {
    nombre: data.nombre,
    documento: data.documento,
    telefono: data.telefono,
    direccion: data.direccion,
    email: data.email,
    foto: data.foto,
  });
};

/**
 * 📌 Actualizar estudiante
 */
export const updateEstudiante = (id, data) => {
  return api.put(`/estudiantes/${id}`, {
    nombre: data.nombre,
    documento: data.documento,
    telefono: data.telefono,
    direccion: data.direccion,
    email: data.email,
    foto: data.foto,
  });
};

/**
 * 📌 Eliminar estudiante
 */
export const deleteEstudiante = (id) => {
  return api.delete(`/estudiantes/${id}`);
};

export const getCuentaEstudiante = (id) =>
  api.get(`/estudiantes/cuenta/${id}`);