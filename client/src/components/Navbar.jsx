import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E7E1B1] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger button on mobile */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl text-[#0D530E] hover:bg-[#FBF5DD] border border-[#E7E1B1] transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-xs sm:text-sm font-medium text-slate-600 truncate max-w-[180px] sm:max-w-none">
          Halo, <span className="text-[#0D530E] font-bold">{user?.nama || 'Admin'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-[#E7E1B1]">
          <div className="w-8 h-8 rounded-full bg-[#E7E1B1] border border-[#306D29]/20 flex items-center justify-center text-[#0D530E] font-extrabold text-xs shadow-inner shrink-0">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800">{user?.nama || 'Admin'}</div>
            <div className="text-[11px] text-slate-500">{user?.email || 'admin@kantor.com'}</div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
