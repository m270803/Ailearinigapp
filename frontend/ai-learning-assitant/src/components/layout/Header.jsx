import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {Bell, User, Menu} from 'lucide-react';

const Header = ({toggleSidebar}) => {
    const { user } = useAuth();
  return <header className='sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-400'>
    <div className="flex items-center justify-between h-full px-6">
        {/* mobile menu button */}
        <button
        onClick={toggleSidebar}
        className='md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        aria-label='Toggle sidebar'
        >
            <Menu size={24} />
        </button>
        <div className="hidden md:block flex-1"></div>
        <div className="flex items-center gap-3">
            <button className='relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100'>
                <Bell size={20} strokeWidth={2} className='group-hover:scale-110 transition-transform duration-200' />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* user profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/60">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 cursor-pointer">
                    <User size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
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
}

export default Header