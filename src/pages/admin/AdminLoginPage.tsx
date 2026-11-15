import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInAdmin } from '../../services/authService';
import { Logo } from '../../components/common/Logo';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Info } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  // Redirect target after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email || !email.includes('@')) {
      setErrorMsg('Masukkan alamat email yang valid.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await signInAdmin(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal masuk. Silakan periksa kredensial Anda.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@antreyuk.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" linkToHome={true} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Login Dashboard Admin
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#6B7280]">
          Kelola antrean dan pengaturan operasional toko Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-gray-100 relative">
          {/* Quick Demo Helper Pill */}
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-2xl bg-[#E8F5EE] border border-[#16865B]/20 text-xs text-[#14543D] space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Info size={15} className="text-[#16865B]" />
                Mode Demo Cepat
              </div>
              <p className="leading-relaxed">
                Supabase belum terhubung ke database remote. Anda dapat langsung menguji login admin dengan akun demo:
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[11px] font-semibold">
                  admin@antreyuk.com / admin123
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1 bg-[#16865B] text-white rounded-lg text-[11px] font-semibold hover:bg-[#14543D] transition-colors"
                >
                  Gunakan Akun Ini
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs animate-shake">
              <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="font-medium flex-1">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Field: Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@antreyuk.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-elevated focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi Hak Akses...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="hover:text-[#16865B] transition-colors">
              ← Kembali ke Website Pelanggan
            </Link>
            <span className="flex items-center gap-1 text-gray-400">
              <ShieldCheck size={14} className="text-[#16865B]" /> Supabase Auth Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

