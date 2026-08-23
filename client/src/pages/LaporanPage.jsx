import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Clock,
  CheckCircle
} from 'lucide-react';

export const LaporanPage = () => {
  const [trxFilter, setTrxFilter] = useState({
    item_type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
  });

  const handleExportStok = (format) => {
    const url = `/api/reports/stok/${format}`;
    window.open(url, '_blank');
  };

  const handleExportTransaksi = (format) => {
    const params = new URLSearchParams();
    if (trxFilter.item_type && trxFilter.item_type !== 'all') params.append('item_type', trxFilter.item_type);
    if (trxFilter.status && trxFilter.status !== 'all') params.append('status', trxFilter.status);
    if (trxFilter.startDate) params.append('startDate', trxFilter.startDate);
    if (trxFilter.endDate) params.append('endDate', trxFilter.endDate);

    const url = `/api/reports/transaksi/${format}?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Laporan & Ekspor Data</h1>
        <p className="text-sm text-slate-600 mt-1">Unduh snapshot inventaris dan histori transaksi dalam format PDF & Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Laporan Stok Inventaris */}
        <div className="bg-white rounded-3xl p-7 border border-[#E7E1B1] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] flex items-center justify-center mb-5">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0D530E]">Laporan Stok Inventaris</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ringkasan data inventaris terkini mencakup daftar barang (total stok, tersedia, digunakan) dan seluruh unit kendaraan operasional beserta status pajak aktifnya.
            </p>

            <div className="mt-6 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#306D29] shrink-0" />
                <span className="font-medium">Snapshot data barang & stok realtime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#306D29] shrink-0" />
                <span className="font-medium">Status pajak kendaraan & pemegang aset</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E7E1B1] grid grid-cols-2 gap-3">
            <button
              onClick={() => handleExportStok('excel')}
              className="py-3 px-4 bg-[#FBF5DD] hover:bg-[#E7E1B1] text-[#0D530E] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-[#E7E1B1] shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#306D29]" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={() => handleExportStok('pdf')}
              className="py-3 px-4 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-[#0D530E]/20"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Card 2: Laporan Histori Transaksi */}
        <div className="bg-white rounded-3xl p-7 border border-[#E7E1B1] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FBF5DD] border border-[#E7E1B1] text-[#0D530E] flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#0D530E]">Laporan Histori Transaksi</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ekspor seluruh riwayat sirkulasi peminjaman dan pengembalian (termasuk nomor surat) dengan filter rentang waktu yang dapat disesuaikan.
            </p>

            {/* Filters */}
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0D530E] uppercase mb-1">Jenis Item</label>
                  <select
                    value={trxFilter.item_type}
                    onChange={(e) => setTrxFilter({ ...trxFilter, item_type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] text-slate-700 font-medium"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="barang">Barang Saja</option>
                    <option value="kendaraan">Kendaraan Saja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0D530E] uppercase mb-1">Status Pinjam</label>
                  <select
                    value={trxFilter.status}
                    onChange={(e) => setTrxFilter({ ...trxFilter, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] text-slate-700 font-medium"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Dipinjam">Masih Dipinjam</option>
                    <option value="Dikembalikan">Sudah Kembali</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0D530E] uppercase mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={trxFilter.startDate}
                    onChange={(e) => setTrxFilter({ ...trxFilter, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0D530E] uppercase mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={trxFilter.endDate}
                    onChange={(e) => setTrxFilter({ ...trxFilter, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] text-slate-700 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E7E1B1] grid grid-cols-2 gap-3">
            <button
              onClick={() => handleExportTransaksi('excel')}
              className="py-3 px-4 bg-[#FBF5DD] hover:bg-[#E7E1B1] text-[#0D530E] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-[#E7E1B1] shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#306D29]" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={() => handleExportTransaksi('pdf')}
              className="py-3 px-4 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-[#0D530E]/20"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
