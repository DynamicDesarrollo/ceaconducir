import api from "./axios";

export const getCombos = async () => {
  const res = await api.get("/combos");
  return res.data;
};

export const crearCombo = async (data) => {
  const res = await api.post("/combos", data);
  return res.data;
};