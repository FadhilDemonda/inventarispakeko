import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@kantor.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Gagal login. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D530E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#306D29] opacity-40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#E7E1B1] opacity-20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#FBF5DD] rounded-3xl shadow-2xl p-8 border border-[#E7E1B1]">
          {/* Brand & Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#306D29] rounded-2xl flex items-center justify-center text-[#FBF5DD] mx-auto shadow-lg shadow-[#0D530E]/30 mb-4 border border-[#E7E1B1]/40">
              <Boxes className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0D530E] tracking-tight">Sistem Inventaris</h2>
            <p className="text-sm text-slate-600 mt-1 font-medium">Masuk untuk mengelola aset barang & kendaraan</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-2">
                Email Akun
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kantor.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E1B1] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D530E] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E1B1] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#306D29]/30 focus:border-[#306D29] transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#306D29] hover:bg-[#255820] text-[#FBF5DD] font-bold rounded-xl shadow-lg shadow-[#0D530E]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          {/* Quick Demo Credential Note */}
          <div className="mt-8 pt-6 border-t border-[#E7E1B1] text-center">
            <p className="text-xs text-slate-600">
              Kredensial Default: <span className="font-mono text-[#0D530E] font-bold">admin@kantor.com</span> / <span className="font-mono text-[#0D530E] font-bold">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
