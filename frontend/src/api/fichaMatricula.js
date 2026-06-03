import api from "../api/axios";

export const getFichaMatricula = async (id) => {
  const res = await api.get(`/matriculas/${id}/completa`);
  return res.data;
};
