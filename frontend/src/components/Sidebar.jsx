import {
  Home,
  Users,
  DollarSign,
  BookOpen,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";

/**
 * Features:
 * - Persistencia (localStorage)
 * - Auto expand on hover (solo desktop)
 * - Indicador activo elegante
 * - Tooltips cuando colapsado
 * - Secciones (General / Finanzas)
 * - Overlay en mobile
 * - Accesible (aria-label, focus)
 */

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 📌 Detectar mobile
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  // 📌 Persistencia
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // 📌 Estado visible real
  const isExpanded = isMobile
    ? isMobileOpen
    : !collapsed || hovering;

  const menuSections = [
    {
      title: "General",
      items: [
        { name: "Dashboard", icon: Home, path: "/" },
        { name: "Estudiantes", icon: Users, path: "/estudiantes" },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { name: "Pagos", icon: DollarSign, path: "/pagos" },
        { name: "Egresos", icon: BookOpen, path: "/egresos" },
      ],
    },
  ];

  return (
    <>
      {/* 🔥 BOTÓN MOBILE */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-md shadow"
      >
        <Menu />
      </button>

      {/* 🔥 OVERLAY MOBILE */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <aside
        onMouseEnter={() => !isMobile && setHovering(true)}
        onMouseLeave={() => !isMobile && setHovering(false)}
        className={`
          fixed md:relative z-50
          h-screen
          ${isExpanded ? "w-64" : "w-20"}
          bg-gradient-to-b from-slate-900 to-slate-800
          text-white
          transition-all duration-300
          flex flex-col
          shadow-2xl
          ${isMobile && !isMobileOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* 🔹 HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isExpanded && (
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="CEA"
                className="w-10 h-10 rounded-full border border-yellow-400"
              />
              <span className="text-yellow-400 font-bold text-sm">
                CEA Conducir Sincelejo
              </span>
            </div>
          )}

          {/* Toggle */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-md hover:bg-slate-700 transition"
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </button>
          )}
        </div>

        {/* 🔹 MENU */}
        <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">

          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              {/* Section title */}
              {isExpanded && (
                <p className="text-xs uppercase text-gray-400 px-3 mb-2">
                  {section.title}
                </p>
              )}

              <div className="space-y-2">
                {section.items.map((item, i) => {
                  const active = location.pathname === item.path;

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileOpen(false);
                      }}
                      className={`
                        group flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer
                        transition-all duration-200 relative
                        focus:outline-none focus:ring-2 focus:ring-yellow-400
                        ${active
                          ? "bg-yellow-400 text-black shadow-md"
                          : "hover:bg-slate-700"}
                      `}
                      aria-label={item.name}
                    >
                      <item.icon size={20} />

                      {isExpanded && (
                        <span className="text-sm font-medium">
                          {item.name}
                        </span>
                      )}

                      {/* Tooltip */}
                      {!isExpanded && (
                        <span className="
                          absolute left-16
                          bg-black text-white text-xs
                          px-2 py-1 rounded-md
                          opacity-0 group-hover:opacity-100
                          transition
                          whitespace-nowrap
                          z-50
                        ">
                          {item.name}
                        </span>
                      )}

                      {/* Indicador activo */}
                      {active && (
                        <div className="absolute right-0 w-1 h-6 bg-black rounded-l-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </nav>

        {/* 🔹 FOOTER */}
        <div className="p-4 border-t border-slate-700 text-xs text-gray-400 text-center">
          {isExpanded ? "© 2026 - DynamicSoft S.A.S" : "©"}
        </div>
      </aside>
    </>
  );
}