// api/dashboard.js
import api from "./axios";

export const getDashboard = async () => {
  const [estudiantes, pagos, egresos] = await Promise.all([
    api.get("/estudiantes"),
    api.get("/pagos"),
    api.get("/egresos"),
  ]);

  return {
    estudiantes: estudiantes.data.data || [],
    pagos: pagos.data || [],
    egresos: egresos.data || [],
  };
};