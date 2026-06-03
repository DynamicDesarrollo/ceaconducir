import api from "./axios";

export const crearEstudianteConMatricula = async (estudiante, matricula) => {
  return api.post("/estudiantes/crear-con-matricula", {
    estudiante,
    matricula,
  });
};
