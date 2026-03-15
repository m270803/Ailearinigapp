import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BrainCircuit,
  BookOpen,
  X,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/documents", icon: FileText, text: "Documents" },
    { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 
          bg-white/95 backdrop-blur-lg 
          border-r border-slate-200/60
          flex flex-col
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:shrink-0 md:h-full
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        {/* Logo / Brand — mobile only (desktop shows brand in Header) */}
        <div className="md:hidden flex items-center justify-between h-16 px-5 border-b border-slate-200/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
              <BrainCircuit className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              AI Learning <span className="text-emerald-600">Assistant</span>
            </h1>
          </div>

          {/* Close button */}
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Navigation — takes all available space */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={2.5}
                      className={`shrink-0 transition-transform duration-200 ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                    <span>{link.text}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout — pinned to bottom */}
        <div className="shrink-0 px-3 py-4 border-t border-slate-200/60">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-x-0.5"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;