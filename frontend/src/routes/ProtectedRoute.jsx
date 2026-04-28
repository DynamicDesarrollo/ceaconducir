import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (adminOnly && user?.rol !== "ADMIN" && user?.rol_id !== 1 && user?.rol !== 1) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}