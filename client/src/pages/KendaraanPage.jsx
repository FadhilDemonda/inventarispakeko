import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kendaraanApi } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Car, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Filter
} from 'lucide-react';

export const KendaraanPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [satkerFilter, setSatkerFilter] = useState('all');
  const [pajakFilter, setPajakFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nama_kendaraan: '',
    nomor_plat: '',
    satker: '',
    tanggal_pajak: '',
    keterangan: '',
  });
  const [formError, setFormError] = useState('');

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ['kendaraan', { search, satker: satkerFilter, status_pajak: pajakFilter }],
    queryFn: () => kendaraanApi.getAll({ search, satker: satkerFilter, status_pajak: pajakFilter }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: kendaraanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => kendaraanApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: kendaraanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsDeleteOpen(false);
      setItemToDelete(null);
    },
    onError: (err) => alert(err.message),
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      nama_kendaraan: '',
      nomor_plat: '',
      satker: '',
      tanggal_pajak: '',
      keterangan: '',
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const dateFormatted = item.tanggal_pajak ? new Date(item.tanggal_pajak).toISOString().split('T')[0] : '';
    setFormData({
      nama_kendaraan: item.nama_kendaraan,
      nomor_plat: item.nomor_plat,
      satker: item.satker,
      tanggal_pajak: dateFormatted,
      keterangan: item.keterangan || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const items = data?.data || [];
  const satkers = Array.from(new Set(items.map(k => k.satker).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Inventaris Kendaraan</h1>
          <p className="text-sm text-slate-600 mt-1">Pantau kendaraan dinas operasional, plat nomor, dan jatuh tempo pajak.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] rounded-xl text-sm font-bold shadow-md shadow-[#0D530E]/20 transition-all border border-[#E7E1B1]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kendaraan</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E1B1] shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kendaraan atau nomor plat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={pajakFilter}
            onChange={(e) => setPajakFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
          >
            <option value="all">Semua Status Pajak</option>
            <option value="Aktif">Pajak Aktif</option>
            <option value="Akan Habis">Akan Habis (&le; 30 Hari)</option>
            <option value="Expired">Pajak Expired</option>
          </select>

          <select
            value={satkerFilter}
            onChange={(e) => setSatkerFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
          >
            <option value="all">Semua Satker</option>
            {satkers.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7E1B1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF5DD]/70 border-b border-[#E7E1B1] text-[#0D530E] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Kendaraan</th>
                <th className="px-6 py-4">Nomor Plat</th>
                <th className="px-6 py-4">Satuan Kerja</th>
                <th className="px-6 py-4">Jatuh Tempo Pajak</th>
                <th className="px-6 py-4">Status Pajak</th>
                <th className="px-6 py-4">Peminjam</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E1B1]/40 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#306D29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat data kendaraan...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data kendaraan yang ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBF5DD]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.nama_kendaraan}</div>
                      {item.keterangan && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.keterangan}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono px-2 py-1 rounded-md bg-[#FBF5DD] border border-[#E7E1B1] font-bold text-[#0D530E] text-xs">
                        {item.nomor_plat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {item.satker}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="font-medium">{new Date(item.tanggal_pajak).toLocaleDateString('id-ID')}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.sisa_hari_pajak < 0 
                          ? `Lewat ${Math.abs(item.sisa_hari_pajak)} hari` 
                          : `Sisa ${item.sisa_hari_pajak} hari`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="pajak" value={item.status_pajak} />
                    </td>
                    <td className="px-6 py-4">
                      {item.peminjam ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          {item.peminjam}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF5DD] text-[#0D530E] border border-[#306D29]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#306D29]"></span>
                          Tersedia di Pool
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#306D29] hover:bg-[#FBF5DD] transition"
                          title="Edit Kendaraan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Kendaraan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Data Kendaraan' : 'Tambah Kendaraan Baru'}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Nama Kendaraan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Toyota Avanza 1.3 G"
              value={formData.nama_kendaraan}
              onChange={(e) => setFormData({ ...formData, nama_kendaraan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
                Nomor Plat
              </label>
              <input
                type="text"
                required
                placeholder="B 1234 KTR"
                value={formData.nomor_plat}
                onChange={(e) => setFormData({ ...formData, nomor_plat: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
                Satuan Kerja (Satker)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Umum & Logistik"
                value={formData.satker}
                onChange={(e) => setFormData({ ...formData, satker: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Tanggal Jatuh Tempo Pajak
            </label>
            <input
              type="date"
              required
              value={formData.tanggal_pajak}
              onChange={(e) => setFormData({ ...formData, tanggal_pajak: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Status pajak dihitung otomatis (Aktif / Akan Habis &le;30 hari / Expired).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Keterangan (Opsional)
            </label>
            <textarea
              rows="2"
              placeholder="Catatan tambahan aset..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 text-sm font-bold text-[#FBF5DD] bg-[#306D29] hover:bg-[#255820] rounded-lg shadow-md shadow-[#0D530E]/20 transition disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Kendaraan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(itemToDelete?.id)}
        title="Hapus Kendaraan"
        message={`Apakah Anda yakin ingin menghapus data kendaraan "${itemToDelete?.nama_kendaraan}" (${itemToDelete?.nomor_plat})?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
