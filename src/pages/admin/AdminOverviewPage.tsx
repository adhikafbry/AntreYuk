import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Store, QueueItem, AdminUser, QueueStatus } from '../../types/queue';
import { StatCard } from '../../components/admin/StatCard';
import { QueueTable } from '../../components/admin/QueueTable';
import { 
  getAdminQueues, 
  callNextWaitingQueue, 
  updateQueueStatus, 
  subscribeToQueueUpdates 
} from '../../services/queueService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  BellRing, 
  ArrowRight,
  TrendingUp,
  Store as StoreIcon
} from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  const { store } = useOutletContext<{ store: Store | null; adminUser: AdminUser | null }>();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCallingNext, setIsCallingNext] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadQueues = async () => {
    try {
      const data = await getAdminQueues(store?.id || DEFAULT_STORE_ID, todayStr);
      setQueues(data);
    } catch (err) {
      console.error('Error loading queues in admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueues();
    const unsub = subscribeToQueueUpdates(store?.id || DEFAULT_STORE_ID, () => {
      loadQueues();
    });
    return () => {
      unsub();
    };
  }, [store?.id]);

  const handleCallNext = async () => {
    try {
      setIsCallingNext(true);
      await callNextWaitingQueue(store?.id || DEFAULT_STORE_ID);
      await loadQueues();
    } catch (err) {
      console.error('Error calling next queue:', err);
    } finally {
      setIsCallingNext(false);
    }
  };

  const handleStatusChange = async (queueId: string, status: QueueStatus) => {
    await updateQueueStatus(queueId, status, store?.id || DEFAULT_STORE_ID);
    await loadQueues();
  };

  // Metrics
  const totalToday = queues.length;
  const waitingCount = queues.filter((q) => q.status === 'waiting').length;
  const servingCount = queues.filter((q) => q.status === 'serving').length;
  const completedCount = queues.filter((q) => q.status === 'completed').length;
  const cancelledCount = queues.filter((q) => q.status === 'cancelled').length;

  const currentServingQueue = queues.find((q) => q.status === 'serving') || queues.find((q) => q.status === 'called');
  const nextWaitingQueue = queues.find((q) => q.status === 'waiting');

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Calling Action */}
      <div className="bg-gradient-to-r from-[#14543D] to-[#16865B] rounded-3xl p-6 sm:p-8 text-white shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold backdrop-blur-sm">
            <TrendingUp size={14} />
            Ringkasan Operasional Hari Ini
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang di AntreYuk Admin
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Semua perubahan nomor antrean di dashboard ini tersinkronisasi secara langsung ke smartphone seluruh pelanggan.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCallNext}
            disabled={isCallingNext || !nextWaitingQueue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#16865B] font-bold text-sm hover:bg-emerald-50 active:scale-95 shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isCallingNext ? (
              <div className="w-4 h-4 border-2 border-[#16865B] border-t-transparent rounded-full animate-spin" />
            ) : (
              <BellRing size={18} />
            )}
            Panggil Nomor Berikutnya {nextWaitingQueue ? `(${nextWaitingQueue.queue_number})` : ''}
          </button>
        </div>
      </div>

      {/* Primary Highlights: Sedang Dilayani & Antrean Berikutnya */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Highlight 1: Sedang Dilayani */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#16865B]" />
              Sedang Dilayani
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Loket 1
            </span>
          </div>

          <div className="my-4">
            <div className="text-5xl font-black text-[#16865B] font-mono tracking-tight">
              {currentServingQueue ? currentServingQueue.queue_number : '-'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentServingQueue ? `Pelanggan: ${currentServingQueue.customer_name}` : 'Belum ada antrean yang sedang dilayani'}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Status Loket</span>
            <span className="font-semibold text-gray-700">
              {currentServingQueue ? 'Sedang Berjalan' : 'Tersedia / Kosong'}
            </span>
          </div>
        </div>

        {/* Highlight 2: Antrean Berikutnya */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" />
              Antrean Berikutnya
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              Waiting List
            </span>
          </div>

          <div className="my-4">
            <div className="text-5xl font-black text-gray-900 font-mono tracking-tight">
              {nextWaitingQueue ? nextWaitingQueue.queue_number : '-'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {nextWaitingQueue ? `Pelanggan: ${nextWaitingQueue.customer_name}` : 'Tidak ada antrean yang sedang menunggu'}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Siap Dipanggil</span>
            <span className="font-semibold text-gray-700">
              {nextWaitingQueue ? 'Urutan Pertama' : 'Semua Sudah Terpanggil'}
            </span>
          </div>
        </div>

        {/* Highlight 3: Status Operasional Toko */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <StoreIcon size={14} className="text-[#16865B]" />
              Operasional Toko
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              store?.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {store?.is_open ? 'Buka' : 'Tutup'}
            </span>
          </div>

          <div className="my-4 space-y-1.5">
            <div className="text-lg font-bold text-gray-900 truncate">
              {store?.name || 'Apotek AntreYuk'}
            </div>
            <p className="text-xs text-gray-500">
              Jam operasional: {store?.opening_time || '08:00'} - {store?.closing_time || '21:00'} WIB
            </p>
            <p className="text-xs text-gray-500">
              Durasi rata-rata: {store?.average_service_duration || 5} menit/pelanggan
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">Penerimaan Antrean</span>
            <span className={`font-semibold ${store?.accepting_queue ? 'text-emerald-600' : 'text-amber-600'}`}>
              {store?.accepting_queue ? 'Menerima Antrean' : 'Ditangguhkan'}
            </span>
          </div>
        </div>
      </div>

      {/* Statistical Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Total Antrean"
          value={totalToday}
          icon={<Users size={20} />}
          subtitle="Tiket diterbitkan hari ini"
          color="emerald"
        />

        <StatCard
          title="Menunggu"
          value={waitingCount}
          icon={<Clock size={20} />}
          subtitle="Belum dipanggil ke loket"
          color="amber"
        />

        <StatCard
          title="Sedang Dilayani"
          value={servingCount}
          icon={<Sparkles size={20} />}
          subtitle="Aktif di loket pelayanan"
          color="blue"
        />

        <StatCard
          title="Selesai"
          value={completedCount}
          icon={<CheckCircle2 size={20} />}
          subtitle="Pelayanan sukses tuntas"
          color="emerald"
        />

        <StatCard
          title="Dibatalkan"
          value={cancelledCount}
          icon={<XCircle size={20} />}
          subtitle="Batal oleh pelanggan/toko"
          color="rose"
        />
      </div>

      {/* Latest Queues Table Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Daftar Antrean Hari Ini
            </h3>
            <p className="text-xs text-gray-500">
              Update seketika saat pelanggan mengambil nomor atau admin mengubah status
            </p>
          </div>

          <Link
            to="/admin/antrean"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#16865B] hover:underline"
          >
            Buka Pengelolaan Lengkap
            <ArrowRight size={14} />
          </Link>
        </div>

        <QueueTable
          queues={queues}
          onStatusChange={handleStatusChange}
          isProcessing={loading}
        />
      </div>
    </div>
  );
};

