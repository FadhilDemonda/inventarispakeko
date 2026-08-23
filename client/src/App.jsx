import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BarangPage } from './pages/BarangPage';
import { KendaraanPage } from './pages/KendaraanPage';
import { TransaksiPage } from './pages/TransaksiPage';
import { ActivityLogPage } from './pages/ActivityLogPage';
import { LaporanPage } from './pages/LaporanPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/barang" element={<BarangPage />} />
              <Route path="/kendaraan" element={<KendaraanPage />} />
              <Route path="/transaksi" element={<TransaksiPage />} />
              <Route path="/activity-log" element={<ActivityLogPage />} />
              <Route path="/laporan" element={<LaporanPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
