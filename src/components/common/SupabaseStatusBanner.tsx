import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Database, CheckCircle, Info, ExternalLink, X, Copy, Check } from 'lucide-react';

export const SupabaseStatusBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key\nVITE_STORE_ID=00000000-0000-0000-0000-000000000001`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="bg-[#14543D] text-white text-xs py-1.5 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-medium text-emerald-100">
              {isConfigured ? (
                <>Database & Realtime: <strong className="text-white">Supabase Cloud Terhubung</strong></>
              ) : (
                <>Engine: <strong className="text-amber-200">Mode Lokal Reactive</strong> (Simulasi Realtime antar-tab aktif)</>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium"
            >
              <Info size={12} />
              {isConfigured ? 'Info Koneksi' : 'Panduan Setup Supabase'}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-elevated max-w-lg w-full p-6 relative border border-gray-100 text-left text-[#1F2937]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5EE] text-[#16865B] flex items-center justify-center">
                <Database size={22} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1F2937]">
                  {isConfigured ? 'Koneksi Supabase Aktif' : 'Konfigurasi Backend Supabase'}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {isConfigured
                    ? 'Aplikasi berjalan menggunakan database dan realtime Supabase.'
                    : 'Aplikasi saat ini menggunakan Local Storage & BroadcastChannel Engine.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-[#4B5563]">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle size={16} className="text-[#16865B]" />
                  Status Saat Ini:
                </div>
                <p className="leading-relaxed">
                  {isConfigured ? (
                    <span className="text-emerald-700 font-medium">
                      Terhubung langsung ke Supabase PostgreSQL & Realtime channel. Semua antrean tersimpan di cloud.
                    </span>
                  ) : (
                    <span>
                      Mode simulasi aktif! Anda dapat membuka dua jendela browser (satu sebagai Pelanggan, satu sebagai Admin di <code>/admin</code>), dan perubahan antrean tersinkronisasi <strong>langsung secara real-time</strong>.
                    </span>
                  )}
                </p>
              </div>

              {!isConfigured && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Langkah Menghubungkan ke Supabase Asli:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-600">
                    <li>Buat project baru di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#16865B] font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink size={10} /></a>.</li>
                    <li>Buka menu <strong>SQL Editor</strong> di Supabase, lalu jalankan query dari file <code>schema.sql</code> yang telah disediakan di root proyek ini.</li>
                    <li>Buka <strong>Project Settings &gt; API</strong>, lalu salin Project URL dan anon public key.</li>
                    <li>Buka file <code>.env</code> di root proyek ini dan masukkan nilainya:</li>
                  </ol>

                  <div className="relative mt-2">
                    <pre className="bg-gray-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STORE_ID=00000000-0000-0000-0000-000000000001`}
                    </pre>
                    <button
                      onClick={handleCopyEnv}
                      className="absolute top-2 right-2 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#16865B] text-white rounded-xl text-xs font-semibold hover:bg-[#14543D] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

