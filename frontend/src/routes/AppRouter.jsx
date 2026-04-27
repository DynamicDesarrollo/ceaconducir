import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Estudiantes from "../pages/Estudiantes";
import Pagos from "../pages/Pagos";
import Egresos from "../pages/Egresos";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import { Navigate } from "react-router-dom";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />

                <Route path="/" element={<Navigate to="/dashboard" />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/estudiantes"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Estudiantes />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pagos"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Pagos />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/egresos"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Egresos />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}