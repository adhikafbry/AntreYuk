import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Store } from '../../types/queue';
import { takeNewQueueNumber } from '../../services/queueService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { Ticket, User, Phone, ArrowLeft, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TakeQueuePage: React.FC = () => {
  const { store } = useOutletContext<{ store: Store | null }>();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = store?.is_open ?? true;
  const isAccepting = store?.accepting_queue ?? true;

  // Validation
  const validateForm = (): boolean => {
    setErrorMsg(null);

    const trimmedName = customerName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg('Mohon masukkan nama lengkap Anda (minimal 2 karakter).');
      return false;
    }

    const trimmedPhone = customerPhone.trim().replace(/[-\s]/g, '');
    // Indonesian phone regex: starts with 08, 628, or +628 and has 9 to 14 digits
    const phoneRegex = /^(\+?62|0)8[1-9][0-9]{7,11}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setErrorMsg('Nomor WhatsApp tidak valid. Gunakan format yang benar, contoh: 08123456789 atau 628123456789.');
      return false;
    }

    if (!isOpen) {
      setErrorMsg('Mohon maaf, toko saat ini sedang tutup.');
      return false;
    }

    if (!isAccepting) {
      setErrorMsg('Penerimaan nomor antrean sedang ditangguhkan sementara.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const result = await takeNewQueueNumber(
        store?.id || DEFAULT_STORE_ID,
        customerName,
        customerPhone
      );

      // Successfully generated queue ticket
      // Redirect to digital ticket page with unique access_token
      navigate(`/tiket/${result.queue.access_token}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kendala saat mengambil nomor antrean. Silakan coba lagi.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#16865B] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 bg-[#E8F5EE] text-[#16865B] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Ticket size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Ambil Nomor Antrean
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            {store?.name || 'Apotek AntreYuk Sehat'}
          </p>
        </div>

        {/* Store Closed Warning */}
        {(!isOpen || !isAccepting) && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">
                {!isOpen ? 'Toko Sedang Tutup' : 'Penerimaan Antrean Ditutup'}
              </strong>
              {!isOpen
                ? `Toko beroperasi pada jam ${store?.opening_time || '08:00'} - ${store?.closing_time || '21:00'} WIB. Anda dapat mengambil antrean saat toko buka.`
                : 'Pengelola toko sedang menangguhkan antrean baru untuk menyelesaikan antrean yang sedang berjalan.'}
            </div>
          </div>
        )}

        {/* Error message toast/banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3 text-xs animate-shake">
            <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field: Nama Pelanggan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                disabled={isSubmitting || !isOpen || !isAccepting}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Nama akan digunakan saat petugas memanggil nomor giliran.
            </p>
          </div>

          {/* Field: WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Nomor WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                required
                disabled={isSubmitting || !isOpen || !isAccepting}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Pastikan nomor aktif untuk konfirmasi atau pembaruan status pelayanan.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !isOpen || !isAccepting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-elevated focus:outline-none focus:ring-2 focus:ring-[#16865B] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sedang Menerbitkan Tiket...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Ambil Nomor Sekarang
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feature guarantee points */}
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#16865B]" />
            <span>Nomor otomatis berurutan secara transparan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#16865B]" />
            <span>Akses langsung tiket digital tanpa registrasi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#16865B]" />
            <span>Bisa dipantau dari luar toko kapan saja</span>
          </div>
        </div>
      </div>
    </div>
  );
};

