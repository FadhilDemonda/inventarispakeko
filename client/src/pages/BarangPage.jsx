import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barangApi } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Filter
} from 'lucide-react';

export const BarangPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [kondisiFilter, setKondisiFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nama_barang: '',
    kondisi: 'Baik',
    total_jumlah: 0,
  });
  const [formError, setFormError] = useState('');

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ['barang', { search, kondisi: kondisiFilter }],
    queryFn: () => barangApi.getAll({ search, kondisi: kondisiFilter }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: barangApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => barangApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => setFormError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: barangApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barang'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsDeleteOpen(false);
      setItemToDelete(null);
    },
    onError: (err) => alert(err.message),
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      nama_barang: '',
      kondisi: 'Baik',
      total_jumlah: 0,
    });
    setFormError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nama_barang: item.nama_barang,
      kondisi: item.kondisi,
      total_jumlah: item.total_jumlah,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Inventaris Barang</h1>
          <p className="text-sm text-slate-600 mt-1">Kelola stok peralatan, alat kantor, dan status ketersediaan.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] rounded-xl text-sm font-bold shadow-md shadow-[#0D530E]/20 transition-all border border-[#E7E1B1]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E1B1] shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={kondisiFilter}
            onChange={(e) => setKondisiFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF5DD]/50 border border-[#E7E1B1] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition text-slate-700 font-medium"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Baik">Kondisi Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7E1B1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF5DD]/70 border-b border-[#E7E1B1] text-[#0D530E] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Barang</th>
                <th className="px-6 py-4">Kondisi Fisik</th>
                <th className="px-6 py-4 text-center">Total Stok</th>
                <th className="px-6 py-4 text-center">Tersedia</th>
                <th className="px-6 py-4 text-center">Dipinjam</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E1B1]/40 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-[#306D29] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Memuat data barang...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data barang yang ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FBF5DD]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.nama_barang}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Diperbarui: {new Date(item.tanggal_update).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="kondisi" value={item.kondisi} />
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">
                      {item.total_jumlah}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-[#306D29]">
                      {item.jumlah_tersedia}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-amber-700">
                      {item.jumlah_digunakan}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type="ketersediaan" value={item.status_ketersediaan} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#306D29] hover:bg-[#FBF5DD] transition"
                          title="Edit Barang"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Barang"
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
        title={editingItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
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
              Nama Barang
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Laptop Dell Latitude 5420"
              value={formData.nama_barang}
              onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Kondisi Fisik
            </label>
            <select
              value={formData.kondisi}
              onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition font-medium"
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-1.5">
              Total Jumlah Unit
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.total_jumlah}
              onChange={(e) => setFormData({ ...formData, total_jumlah: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 bg-[#FBF5DD]/40 border border-[#E7E1B1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
            />
            {editingItem && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                Saat ini dipinjam: <span className="font-bold text-[#0D530E]">{editingItem.jumlah_digunakan} unit</span>. Stok tersedia akan otomatis dihitung (<code className="font-mono text-[#306D29] font-bold">Total - Dipinjam</code>).
              </p>
            )}
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
              {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(itemToDelete?.id)}
        title="Hapus Barang"
        message={`Apakah Anda yakin ingin menghapus data "${itemToDelete?.nama_barang}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
