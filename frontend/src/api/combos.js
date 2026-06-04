import api from "./axios";

export const getCombos = async () => {
  const res = await api.get("/combos");
  return res.data;
};

export const crearCombo = async (data) => {
  const res = await api.post("/combos", data);
  return res.data;
};

export const actualizarCombo = async (id, data) => {
  const res = await api.put(`/combos/${id}`, data);
  return res.data;
};

export const eliminarCombo = async (id) => {
  const res = await api.delete(`/combos/${id}`);
  return res.data;
};