import api from "./axios";

export const crearMatricula = async (data) => {
  return api.post("/matriculas", data);
};
