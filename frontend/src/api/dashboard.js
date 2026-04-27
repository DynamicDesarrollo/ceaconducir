// api/dashboard.js
import axios from "axios";

export const getDashboard = async () => {
  const token = localStorage.getItem("token");

  const [estudiantes, pagos, egresos] = await Promise.all([
    axios.get("http://localhost:4000/api/estudiantes", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get("http://localhost:4000/api/pagos", {
      headers: { Authorization: `Bearer ${token}` },
    }),
    axios.get("http://localhost:4000/api/egresos", {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  return {
    estudiantes: estudiantes.data.data || [],
    pagos: pagos.data || [],
    egresos: egresos.data || [],
  };
};