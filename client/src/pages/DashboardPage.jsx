import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { 
  Package, 
  Car, 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const DashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#306D29] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Gagal memuat ringkasan dashboard: {error.message}
      </div>
    );
  }

  const summary = data?.data || {};
  const { barang, kendaraan, transaksi, pajak_alerts, recent_activities } = summary;

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Ringkasan Inventaris</h1>
          <p className="text-sm text-slate-600 mt-1">Status dan pemantauan menyeluruh aset kantor hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transaksi"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] rounded-xl text-sm font-bold shadow-md shadow-[#0D530E]/20 transition-all border border-[#E7E1B1]/30"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Peminjaman Baru</span>
          </Link>
        </div>
      </div>

      {/* Pajak Alert Banner (PRD §4.7) */}
      {pajak_alerts && pajak_alerts.total_alert > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-[#FBF5DD] border border-amber-300/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Peringatan Pajak Kendaraan ({pajak_alerts.total_alert} Unit Memerlukan Perhatian)
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                {pajak_alerts.expired.length > 0 && (
                  <span className="text-rose-700 font-bold mr-3">
                    🚨 {pajak_alerts.expired.length} Pajak Expired
                  </span>
                )}
                {pajak_alerts.akanHabis.length > 0 && (
                  <span className="text-amber-800 font-bold">
                    ⚠️ {pajak_alerts.akanHabis.length} Jatuh Tempo &le; 30 Hari
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/kendaraan"
            className="px-4 py-2 bg-white hover:bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <span>Tinjau di Menu Kendaraan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Barang */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1B1] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Barang</span>
            <div className="w-10 h-10 rounded-xl bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0D530E]">{barang?.total_jenis_barang || 0}</span>
            <span className="text-xs text-slate-600 font-medium">Jenis ({barang?.total_unit_barang || 0} Unit)</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
            <span className="text-[#306D29] font-bold">Tersedia: {barang?.total_tersedia || 0}</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">Dipinjam: {barang?.total_digunakan || 0}</span>
          </div>
        </div>

        {/* Card 2: Kendaraan */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1B1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kendaraan</span>
            <div className="w-10 h-10 rounded-xl bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0D530E]">{kendaraan?.total_kendaraan || 0}</span>
            <span className="text-xs text-slate-600 font-medium">Unit Terdaftar</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
            <span className="text-[#306D29] font-bold">Siap: {kendaraan?.kendaraan_tersedia || 0}</span>
            <span>•</span>
            <span className="text-amber-700 font-bold">Dipinjam: {kendaraan?.kendaraan_dipinjam || 0}</span>
          </div>
        </div>

        {/* Card 3: Peminjaman Aktif */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1B1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pinjaman Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{transaksi?.pinjaman_aktif || 0}</span>
            <span className="text-xs text-slate-600 font-medium">Item Belum Kembali</span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Total Seluruh Riwayat: <span className="font-bold text-[#0D530E]">{transaksi?.total_transaksi || 0}</span>
          </div>
        </div>

        {/* Card 4: Status Stok Habis */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E1B1] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stok Kritis</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700">{barang?.barang_habis || 0}</span>
            <span className="text-xs text-slate-600 font-medium">Barang Stok 0</span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Kondisi stok tersedia habis dipinjam
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Logs (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E7E1B1] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#0D530E]">Aktivitas Terkini (Audit Trail)</h2>
            </div>
            <Link
              to="/activity-log"
              className="text-xs font-bold text-[#306D29] hover:text-[#0D530E] flex items-center gap-1"
            >
              <span>Lihat Semua Log</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E7E1B1]/40">
            {recent_activities && recent_activities.length > 0 ? (
              recent_activities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#306D29] mt-1.5 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                      {act.detail}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {new Date(act.timestamp).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#FBF5DD] text-[#0D530E] border border-[#E7E1B1] shrink-0">
                    {act.action}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>

        {/* Quick Links & Info (1 col) */}
        <div className="space-y-6">
          <div className="bg-[#0D530E] rounded-3xl p-6 text-[#FBF5DD] shadow-xl border border-[#306D29]">
            <h3 className="font-bold text-base text-white">Alur Kerja Inventaris</h3>
            <p className="text-xs text-[#E7E1B1] mt-2 leading-relaxed">
              Semua mutasi stok barang dan peminjaman kendaraan dilakukan secara otomatis melalui menu <span className="text-white font-bold underline">Transaksi & Pinjam</span> dengan integritas transaksi ACID.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link
                to="/barang"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#306D29]/60 hover:bg-[#306D29] transition text-xs font-bold text-[#FBF5DD] border border-[#E7E1B1]/20"
              >
                <span>Kelola Data Barang</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/kendaraan"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#306D29]/60 hover:bg-[#306D29] transition text-xs font-bold text-[#FBF5DD] border border-[#E7E1B1]/20"
              >
                <span>Kelola Data Kendaraan</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/laporan"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#306D29]/60 hover:bg-[#306D29] transition text-xs font-bold text-[#FBF5DD] border border-[#E7E1B1]/20"
              >
                <span>Unduh Laporan PDF / Excel</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
