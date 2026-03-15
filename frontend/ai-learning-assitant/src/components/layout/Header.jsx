import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu, BrainCircuit } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shrink-0">
      <div className="flex items-center justify-between h-full px-6 gap-4">

        {/* Left side: hamburger (mobile) + brand (desktop) */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          {/* App brand — desktop only (hidden on mobile since sidebar shows it) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20">
              <BrainCircuit className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              AI Learning <span className="text-emerald-600">Assistant</span>
            </span>
          </div>
        </div>

        {/* Right side: notifications + user */}
        <div className="flex items-center gap-3 ml-auto">
          <button className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Bell size={20} strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 cursor-pointer">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col">
              <p className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-500">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;