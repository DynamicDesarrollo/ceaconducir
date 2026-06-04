import api from "./axios";

export const getCategorias = async () => {
  const res = await api.get("/categorias");
  return res.data;
};

export const crearCategoria = async (data) => {
  const res = await api.post("/categorias", data);
  return res.data;
};

export const actualizarCategoria = async (id, data) => {
  const res = await api.put(`/categorias/${id}`, data);
  return res.data;
};

export const eliminarCategoria = async (id) => {
  const res = await api.delete(`/categorias/${id}`);
  return res.data;
};