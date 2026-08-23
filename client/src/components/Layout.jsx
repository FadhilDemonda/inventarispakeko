import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { user, loading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D530E] flex items-center justify-center text-[#FBF5DD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#306D29] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[#E7E1B1]">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FBF5DD] font-sans antialiased overflow-x-hidden">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
