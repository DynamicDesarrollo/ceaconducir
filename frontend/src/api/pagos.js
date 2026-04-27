import api from "./axios";

// 🔥 obtener pagos (ya incluye token automático)
export const getPagos = () => api.get("/pagos");

// 🔥 crear pago (ya incluye token automático)
export const createPago = (data) => api.post("/pagos", data);