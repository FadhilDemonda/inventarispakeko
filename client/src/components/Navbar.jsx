import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E7E1B1] px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-slate-600">
          Selamat datang, <span className="text-[#0D530E] font-bold">{user?.nama || 'Admin'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#E7E1B1]">
          <div className="w-8 h-8 rounded-full bg-[#E7E1B1] border border-[#306D29]/20 flex items-center justify-center text-[#0D530E] font-extrabold text-xs shadow-inner">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800">{user?.nama || 'Admin'}</div>
            <div className="text-[11px] text-slate-500">{user?.email || 'admin@kantor.com'}</div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
