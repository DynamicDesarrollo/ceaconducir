import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Navbar() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg px-6 flex items-center justify-between">

            {/* IZQUIERDA */}
            <h2 className="font-semibold text-lg tracking-wide">
                Panel Administrativo
            </h2>

            {/* BUSCADOR */}
            <div className="hidden md:flex items-center bg-white/10 px-3 py-1.5 rounded-lg w-80">
                <Search size={18} className="text-gray-300" />
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-transparent outline-none px-2 text-sm w-full placeholder:text-gray-400"
                />
            </div>

            {/* DERECHA */}
            <div className="flex items-center gap-4 relative">

                {/* NOTIFICACIONES */}
                <div className="relative cursor-pointer">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
                        3
                    </span>
                </div>

                {/* USUARIO */}
                <div
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-lg transition"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">
                            {user?.nombre || "Admin"}
                        </p>
                        <p className="text-xs text-gray-300">
                            {user?.email}
                        </p>
                        <p className="text-xs text-gray-300">Administrador</p>
                    </div>

                    <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                        {user?.nombre?.charAt(0) || "A"}
                    </div>
                    <button
                        onClick={logout}
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Cerrar sesión
                    </button>
                </div>



                {/* DROPDOWN */}
                {open && (
                    <div className="absolute right-0 top-14 bg-white text-black rounded-xl shadow-lg w-40 overflow-hidden">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}