import React from 'react';

export const StatusBadge = ({ type, value }) => {
  if (type === 'kondisi') {
    const map = {
      'Baik': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'Rusak Ringan': 'bg-amber-50 text-amber-800 border-amber-300',
      'Rusak Berat': 'bg-rose-50 text-rose-800 border-rose-300'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {value}
      </span>
    );
  }

  if (type === 'ketersediaan') {
    const map = {
      'Tersedia Lengkap': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'Tersedia': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'Sebagian Dipinjam': 'bg-[#E7E1B1]/60 text-[#1b4317] border-[#E7E1B1]',
      'Sedang Dipinjam': 'bg-amber-50 text-amber-800 border-amber-300',
      'Habis': 'bg-rose-50 text-rose-800 border-rose-300'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {value}
      </span>
    );
  }

  if (type === 'pajak') {
    const map = {
      'Aktif': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'Akan Habis': 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse',
      'Expired': 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {value === 'Akan Habis' && '⚠️ '}
        {value === 'Expired' && '🚨 '}
        {value}
      </span>
    );
  }

  if (type === 'transaksi') {
    const map = {
      'Dipinjam': 'bg-amber-50 text-amber-800 border-amber-300',
      'Dikembalikan': 'bg-[#FBF5DD] text-[#0D530E] border-[#306D29]/40',
      'Terlambat': 'bg-rose-50 text-rose-800 border-rose-300'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
      {value}
    </span>
  );
};
