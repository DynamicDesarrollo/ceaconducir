// api/dashboard.js
import api from "./axios";

export const getDashboard = async () => {
  const [estudiantes, pagos, egresos] = await Promise.all([
    api.get("/estudiantes", { params: { limit: 10000 } }),
    api.get("/pagos"),
    api.get("/egresos"),
  ]);

  return {
    estudiantes: estudiantes.data.data || [],
    totalEstudiantes: estudiantes.data.total || (estudiantes.data.data ? estudiantes.data.data.length : 0),
    pagos: pagos.data || [],
    egresos: egresos.data || [],
  };
};