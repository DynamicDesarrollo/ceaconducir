import api from "./axios";

export const getCategorias = async () => {
  const res = await api.get("/categorias");
  return res.data;
};
