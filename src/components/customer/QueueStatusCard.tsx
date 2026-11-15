import React from 'react';
import { Link } from 'react-router-dom';
import { Store, QueueStats } from '../../types/queue';
import { Users, Clock, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Ticket } from 'lucide-react';

interface QueueStatusCardProps {
  store: Store | null;
  stats: QueueStats | null;
  isLoading?: boolean;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({
  store,
  stats,
  isLoading = false,
}) => {
  const isOpen = store?.is_open ?? true;
  const isAccepting = store?.accepting_queue ?? true;
  const currentServing = stats?.current_serving_number || '-';
  const waitingCount = stats?.waiting || 0;
  const avgDuration = store?.average_service_duration || 5;
  const estimatedWait = waitingCount * avgDuration;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 relative overflow-hidden transition-all hover:shadow-elevated">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#E8F5EE] rounded-full blur-3xl pointer-events-none opacity-60" />

      {/* Top Header: Store Status & Acceptance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            {isOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            )}
          </span>
          <span className="text-sm font-bold text-[#1F2937]">
            Status Toko:
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {isOpen ? 'Buka Sekarang' : 'Tutup'}
          </span>
        </div>

        <div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
            isAccepting && isOpen
              ? 'bg-[#E8F5EE] text-[#14543D] border border-[#16865B]/20'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isAccepting && isOpen ? (
              <>
                <CheckCircle size={13} className="text-[#16865B]" />
                Penerimaan Antrean: Buka
              </>
            ) : (
              <>
                <AlertTriangle size={13} className="text-amber-600" />
                Penerimaan Antrean: Ditutup
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Grid: Live Queue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
        {/* Metric 1: Currently Serving */}
        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-gray-100/80 flex flex-col items-center text-center relative group">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-[#16865B]" />
            Sedang Dilayani
          </span>
          <div className="mt-2 text-4xl sm:text-5xl font-black text-[#16865B] tracking-tight font-mono">
            {isLoading ? (
              <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-lg mx-auto" />
            ) : (
              currentServing
            )}
          </div>
          <span className="mt-2 text-xs text-gray-500">
            {currentServing === '-' ? 'Belum ada panggilan' : 'Nomor loket aktif'}
          </span>
        </div>

        {/* Metric 2: Waiting in Line */}
        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-gray-100/80 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-1">
            <Users size={14} className="text-blue-600" />
            Sedang Menunggu
          </span>
          <div className="mt-2 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight font-mono">
            {isLoading ? (
              <div className="h-12 w-16 bg-gray-200 animate-pulse rounded-lg mx-auto" />
            ) : (
              waitingCount
            )}
          </div>
          <span className="mt-2 text-xs text-gray-500">
            {waitingCount === 0 ? 'Tidak ada antrean aktif' : 'Pelanggan dalam antrean'}
          </span>
        </div>

        {/* Metric 3: Estimated Wait Time */}
        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-gray-100/80 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5 mb-1">
            <Clock size={14} className="text-amber-600" />
            Perkiraan Tunggu
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            {isLoading ? (
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-lg mx-auto" />
            ) : (
              `~${estimatedWait} mnt`
            )}
          </div>
          <span className="mt-2 text-xs text-gray-500">
            Rata-rata {avgDuration} menit/orang
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 text-center sm:text-left">
          <p className="font-medium text-gray-700">{store?.name || 'Apotek AntreYuk Sehat'}</p>
          <p>Jam layanan hari ini: {store?.opening_time || '08:00'} - {store?.closing_time || '21:00'} WIB</p>
        </div>

        <div className="w-full sm:w-auto">
          {isOpen && isAccepting ? (
            <Link
              to="/ambil-antrean"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-card transition-all"
            >
              <Ticket size={18} />
              Ambil Nomor Antrean
              <ArrowRight size={16} />
            </Link>
          ) : (
            <div className="px-5 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-xs text-center border border-gray-200">
              Antrean Sedang Ditutup Sementara
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

