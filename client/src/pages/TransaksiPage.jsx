import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transaksiApi, barangApi, kendaraanApi } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Package,
  Car,
  FileText
} from 'lucide-react';

export const TransaksiPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal Pinjam State
  const [isPinjamOpen, setIsPinjamOpen] = useState(false);
  const [pinjamForm, setPinjamForm] = useState({
    nomor_surat: '',
    item_type: 'barang',
    item_id: '',
    peminjam: '',
    jumlah: 1,
    tanggal_pinjam: new Date().toISOString().slice(0, 16),
    keterangan: '',
  });
  const [pinjamError, setPinjamError] = useState('');

  // Modal Kembali State
  const [isKembaliOpen, setIsKembaliOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [kembaliForm, setKembaliForm] = useState({
    tanggal_kembali: new Date().toISOString().slice(0, 16),
    keterangan: '',
  });
  const [kembaliError, setKembaliError] = useState('');

  // Fetch Transaksi
  const { data: trxData, isLoading: trxLoading } = useQuery({
    queryKey: ['transaksi', { search, item_type: typeFilter, status: statusFilter }],
    queryFn: () => transaksiApi.getAll({ search, item_type: typeFilter, status: statusFilter }),
  });

  // Fetch Barang & Kendaraan untuk form pilihan
  const { data: barangData } = useQuery({
    queryKey: ['barang'],
    queryFn: () => barangApi.getAll({}),
    enabled: isPinjamOpen && pinjamForm.item_type === 'barang',
  });

  const { data: kendaraanData } = useQuery({
    queryKey: ['kendaraan'],
    queryFn: () => kendaraanApi.getAll({}),
    enabled: isPinjamOpen && pinjamForm.item_type === 'kendaraan',
  });

  // Mutations
  const pinjamMutation = useMutation({
    mutationFn: transaksiApi.pinjam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsPinjamOpen(false);
      resetPinjamForm();
    },
    onError: (err) => setPinjamError(err.message),
  });

  const kembaliMutation = useMutation({
    mutationFn: ({ id, data }) => transaksiApi.kembali(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaksi'] });
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsKembaliOpen(false);
      setSelectedTrx(null);
    },
    onError: (err) => setKembaliError(err.message),
  });

  const resetPinjamForm = () => {
    setPinjamForm({
      nomor_surat: '',
      item_type: 'barang',
      item_id: '',
      peminjam: '',
      jumlah: 1,
      tanggal_pinjam: new Date().toISOString().slice(0, 16),
      keterangan: '',
    });
    setPinjamError('');
  };

  const handleOpenKembali = (trx) => {
    setSelectedTrx(trx);
    setKembaliForm({
      tanggal_kembali: new Date().toISOString().slice(0, 16),
      keterangan: trx.keterangan || '',
    });
    setKembaliError('');
    setIsKembaliOpen(true);
  };

  const handlePinjamSubmit = (e) => {
    e.preventDefault();
    setPinjamError('');
    pinjamMutation.mutate(pinjamForm);
  };

  const handleKembaliSubmit = (e) => {
    e.preventDefault();
    setKembaliError('');
    kembaliMutation.mutate({ id: selectedTrx.id, data: kembaliForm });
  };

  const transactions = trxData?.data || [];
  const availableBarang = (barangData?.data || []).filter(b => b.jumlah_tersedia > 0);
  const availableKendaraan = (kendaraanData?.data || []).filter(k => !k.peminjam);

  const selectedBarangObj = (barangData?.data || []).find(b => String(b.id) === String(pinjamForm.item_id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Transaksi Peminjaman</h1>
          <p className="text-sm text-slate-600 mt-1">Catat peminjaman & pengembalian barang atau kendaraan dinas.</p>
        </div>
        <button
          onClick={() => {
            resetPinjamForm();
            setIsPinjamOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] rounded-xl text-sm font-bold shadow-md shadow-[#0D530E]/20 transition-all border border-[#E7E1B1]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Peminjaman Baru</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E1B1] shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama peminjam, nomor surat, atau item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
          >
            <option value="all">Semua Tipe</option>
            <option value="barang">Barang Saja</option>
            <option value="kendaraan">Kendaraan Saja</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="Dipinjam">Sedang Dipinjam</option>
            <option value="Dikembalikan">Sudah Dikembalikan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7E1B1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF5DD]/70 border-b border-[#E7E1B1] text-[#0D530E] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">No. Surat</th>
                <th className="px-6 py-4">Tipe & Item</th>
                <th className="px-6 py-4">Peminjam</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4">Tanggal Pinjam</th>
                <th className="px-6 py-4">Tanggal Kembali</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E1B1]/40 font-medium text-slate-700">
              {trxLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#306D29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    Belum ada transaksi peminjaman yang dicatat.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#FBF5DD]/30 transition-colors">
                    <td className="px-6 py-4">
                      {trx.nomor_surat ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0D530E] bg-[#FBF5DD] px-2.5 py-1 rounded-md border border-[#E7E1B1] w-fit">
                          <FileText className="w-3.5 h-3.5 text-[#306D29]" />
                          <span>{trx.nomor_surat}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal italic">- Tanpa Surat -</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg border ${trx.item_type === 'barang' ? 'bg-[#FBF5DD] text-[#306D29] border-[#E7E1B1]' : 'bg-[#E7E1B1]/50 text-[#0D530E] border-[#E7E1B1]'}`}>
                          {trx.item_type === 'barang' ? <Package className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{trx.nama_item}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {trx.item_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {trx.peminjam}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {trx.jumlah}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(trx.tanggal_pinjam).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {trx.tanggal_kembali ? (
                        new Date(trx.tanggal_kembali).toLocaleString('id-ID')
                      ) : (
                        <span className="text-amber-700 font-bold text-xs">Belum Kembali</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="transaksi" value={trx.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {trx.status === 'Dipinjam' ? (
                        <button
                          onClick={() => handleOpenKembali(trx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] rounded-lg text-xs font-bold shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Kembalikan</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Peminjaman Baru */}
      <Modal
        isOpen={isPinjamOpen}
        onClose={() => setIsPinjamOpen(false)}
        title="Form Peminjaman Inventaris"
      >
        {pinjamError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pinjamError}</span>
          </div>
        )}

        <form onSubmit={handlePinjamSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Nomor Surat Permohonan / Dinas <span className="text-slate-400 font-normal normal-case">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 005/SPT/LOG/VIII/2026"
              value={pinjamForm.nomor_surat}
              onChange={(e) => setPinjamForm({ ...pinjamForm, nomor_surat: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Jenis Inventaris
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPinjamForm({ ...pinjamForm, item_type: 'barang', item_id: '', jumlah: 1 })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  pinjamForm.item_type === 'barang'
                    ? 'bg-[#306D29] border-[#306D29] text-[#FBF5DD] ring-2 ring-[#306D29]/20 shadow-sm'
                    : 'bg-white border-[#E7E1B1] text-slate-700 hover:bg-[#FBF5DD]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Barang Kantor</span>
              </button>

              <button
                type="button"
                onClick={() => setPinjamForm({ ...pinjamForm, item_type: 'kendaraan', item_id: '', jumlah: 1 })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  pinjamForm.item_type === 'kendaraan'
                    ? 'bg-[#306D29] border-[#306D29] text-[#FBF5DD] ring-2 ring-[#306D29]/20 shadow-sm'
                    : 'bg-white border-[#E7E1B1] text-slate-700 hover:bg-[#FBF5DD]'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Kendaraan Dinas</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Pilih {pinjamForm.item_type === 'barang' ? 'Barang' : 'Kendaraan'}
            </label>
            <select
              required
              value={pinjamForm.item_id}
              onChange={(e) => setPinjamForm({ ...pinjamForm, item_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            >
              <option value="">-- Pilih Item yang Tersedia --</option>
              {pinjamForm.item_type === 'barang' ? (
                availableBarang.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nama_barang} (Sisa Stok: {b.jumlah_tersedia} unit)
                  </option>
                ))
              ) : (
                availableKendaraan.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kendaraan} - {k.nomor_plat} ({k.satker})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
                Nama Peminjam
              </label>
              <input
                type="text"
                required
                placeholder="Nama peminjam / divisi"
                value={pinjamForm.peminjam}
                onChange={(e) => setPinjamForm({ ...pinjamForm, peminjam: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
              />
            </div>

            {pinjamForm.item_type === 'barang' ? (
              <div>
                <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
                  Jumlah Unit (Maks: {selectedBarangObj?.jumlah_tersedia || 1})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedBarangObj?.jumlah_tersedia || 9999}
                  required
                  value={pinjamForm.jumlah}
                  onChange={(e) => setPinjamForm({ ...pinjamForm, jumlah: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
                  Kuantitas
                </label>
                <input
                  type="text"
                  disabled
                  value="1 Unit Fisik"
                  className="w-full px-3.5 py-2.5 bg-[#E7E1B1]/40 border border-[#E7E1B1] rounded-xl text-sm text-slate-600 cursor-not-allowed font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Waktu Peminjaman
            </label>
            <input
              type="datetime-local"
              required
              value={pinjamForm.tanggal_pinjam}
              onChange={(e) => setPinjamForm({ ...pinjamForm, tanggal_pinjam: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Keperluan / Catatan (Opsional)
            </label>
            <textarea
              rows="2"
              placeholder="Contoh: Rapat dinas ke luar kota / Presentasi client..."
              value={pinjamForm.keterangan}
              onChange={(e) => setPinjamForm({ ...pinjamForm, keterangan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPinjamOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pinjamMutation.isPending}
              className="px-5 py-2 text-sm font-bold text-[#FBF5DD] bg-[#306D29] hover:bg-[#255820] rounded-lg shadow-md shadow-[#0D530E]/20 transition disabled:opacity-50"
            >
              {pinjamMutation.isPending ? 'Memproses...' : 'Konfirmasi Pinjam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Pengembalian */}
      <Modal
        isOpen={isKembaliOpen}
        onClose={() => setIsKembaliOpen(false)}
        title="Konfirmasi Pengembalian Item"
      >
        {kembaliError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{kembaliError}</span>
          </div>
        )}

        <form onSubmit={handleKembaliSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-[#FBF5DD] border border-[#E7E1B1]">
            <div className="text-xs text-slate-600">Item yang dikembalikan:</div>
            <div className="font-bold text-[#0D530E] text-sm mt-0.5">{selectedTrx?.nama_item}</div>
            <div className="text-xs text-slate-700 mt-1">
              Peminjam: <span className="font-bold">{selectedTrx?.peminjam}</span> ({selectedTrx?.jumlah} unit)
              {selectedTrx?.nomor_surat && (
                <span className="ml-2 font-mono font-bold text-[#306D29]">[No: {selectedTrx.nomor_surat}]</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Waktu Pengembalian
            </label>
            <input
              type="datetime-local"
              required
              value={kembaliForm.tanggal_kembali}
              onChange={(e) => setKembaliForm({ ...kembaliForm, tanggal_kembali: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Catatan Kondisi Pengembalian (Opsional)
            </label>
            <textarea
              rows="2"
              placeholder="Contoh: Dikembalikan dalam keadaan baik dan lengkap."
              value={kembaliForm.keterangan}
              onChange={(e) => setKembaliForm({ ...kembaliForm, keterangan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsKembaliOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={kembaliMutation.isPending}
              className="px-5 py-2 text-sm font-bold text-[#FBF5DD] bg-[#306D29] hover:bg-[#255820] rounded-lg shadow-md shadow-[#0D530E]/20 transition disabled:opacity-50"
            >
              {kembaliMutation.isPending ? 'Menyimpan...' : 'Selesaikan Pengembalian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
