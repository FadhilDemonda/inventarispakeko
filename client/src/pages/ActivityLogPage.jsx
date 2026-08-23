import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityLogApi } from '../services/api';
import { 
  History, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Package,
  Car,
  ArrowLeftRight,
  Key
} from 'lucide-react';

export const ActivityLogPage = () => {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['activityLog', { page, entity_type: entityFilter, action: actionFilter }],
    queryFn: () => activityLogApi.getLogs({ page, limit: 15, entity_type: entityFilter, action: actionFilter }),
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const getEntityIcon = (entity) => {
    switch (entity) {
      case 'barang': return <Package className="w-4 h-4 text-[#306D29]" />;
      case 'kendaraan': return <Car className="w-4 h-4 text-[#0D530E]" />;
      case 'transaksi': return <ArrowLeftRight className="w-4 h-4 text-amber-700" />;
      case 'auth': return <Key className="w-4 h-4 text-[#306D29]" />;
      default: return <ShieldCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionBadge = (action) => {
    const map = {
      'create': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'update': 'bg-[#E7E1B1]/60 text-[#1b4317] border-[#E7E1B1]',
      'delete': 'bg-rose-50 text-rose-800 border-rose-300',
      'pinjam': 'bg-amber-50 text-amber-800 border-amber-300',
      'kembali': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'login': 'bg-[#E7E1B1] text-[#0D530E] border-[#306D29]/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[action] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Activity Log (Audit Trail)</h1>
          <p className="text-sm text-slate-600 mt-1">Rekam jejak setiap aksi sistem untuk akuntabilitas dan audit inventaris.</p>
        </div>
        <div className="text-xs font-bold px-3.5 py-2 rounded-xl bg-[#E7E1B1] text-[#0D530E] border border-[#306D29]/20 shadow-sm">
          Total Tercatat: {pagination.total} Aktivitas
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E1B1] shadow-sm flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
        >
          <option value="all">Semua Entitas</option>
          <option value="barang">Barang</option>
          <option value="kendaraan">Kendaraan</option>
          <option value="transaksi">Transaksi</option>
          <option value="auth">Autentikasi</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
        >
          <option value="all">Semua Aksi</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="pinjam">Pinjam</option>
          <option value="kembali">Kembali</option>
          <option value="login">Login</option>
        </select>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-[#E7E1B1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF5DD]/70 border-b border-[#E7E1B1] text-[#0D530E] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Entitas</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E1B1]/40 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#306D29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat audit log...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    Tidak ada catatan aktivitas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FBF5DD]/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#FBF5DD] border border-[#E7E1B1]">
                          {getEntityIcon(log.entity_type)}
                        </div>
                        <span className="capitalize font-bold text-slate-800">{log.entity_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 leading-relaxed">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-[#E7E1B1] flex items-center justify-between bg-[#FBF5DD]/30">
          <span className="text-xs text-slate-600">
            Halaman <span className="font-bold text-[#0D530E]">{pagination.page}</span> dari <span className="font-bold text-[#0D530E]">{pagination.totalPages || 1}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-[#E7E1B1] text-slate-700 bg-white hover:bg-[#FBF5DD] disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg border border-[#E7E1B1] text-slate-700 bg-white hover:bg-[#FBF5DD] disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
