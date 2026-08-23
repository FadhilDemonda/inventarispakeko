import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Car, 
  ArrowLeftRight, 
  History, 
  FileText,
  Boxes
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Inventaris Barang', path: '/barang', icon: Package },
  { name: 'Inventaris Kendaraan', path: '/kendaraan', icon: Car },
  { name: 'Transaksi & Pinjam', path: '/transaksi', icon: ArrowLeftRight },
  { name: 'Activity Log', path: '/activity-log', icon: History },
  { name: 'Laporan & Export', path: '/laporan', icon: FileText },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0D530E] text-[#FBF5DD] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#1b4317] shadow-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-emerald-900/50 gap-3 bg-[#083709]/40">
        <div className="w-9 h-9 rounded-xl bg-[#306D29] border border-[#E7E1B1]/30 flex items-center justify-center text-[#FBF5DD] shadow-md shadow-emerald-950/40">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight leading-none text-base">InvenOffice</h1>
          <span className="text-[11px] text-[#E7E1B1] font-medium">Sistem Inventaris Kantor</span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#E7E1B1]/70">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#306D29] text-white shadow-md shadow-[#083709]/30 font-semibold border border-[#E7E1B1]/20'
                    : 'text-[#FBF5DD]/80 hover:bg-[#1b4317] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-emerald-900/40 text-xs text-[#E7E1B1]/80 flex items-center justify-between bg-[#083709]/30">
        <span>Fase 1: Local System</span>
        <span className="px-2 py-0.5 rounded bg-[#306D29] text-[#FBF5DD] font-mono text-[10px] font-bold">v1.0</span>
      </div>
    </aside>
  );
};
