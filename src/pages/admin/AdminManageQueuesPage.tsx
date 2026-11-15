import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Store, QueueItem, AdminUser, QueueStatus } from '../../types/queue';
import { QueueTable } from '../../components/admin/QueueTable';
import { 
  getAdminQueues, 
  callNextWaitingQueue, 
  updateQueueStatus, 
  subscribeToQueueUpdates 
} from '../../services/queueService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { 
  BellRing, 
  Search, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminManageQueuesPage: React.FC = () => {
  const { store } = useOutletContext<{ store: Store | null; adminUser: AdminUser | null }>();
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCallingNext, setIsCallingNext] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadQueues = async () => {
    try {
      const data = await getAdminQueues(store?.id || DEFAULT_STORE_ID, todayStr);
      setQueues(data);
    } catch (err) {
      console.error('Error loading queues in admin manage:', err);
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

  // Filter & Search Logic
  const filteredQueues = queues.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query || 
      item.queue_number.toLowerCase().includes(query) ||
      item.customer_name.toLowerCase().includes(query) ||
      item.customer_phone.includes(query);
    return matchesStatus && matchesSearch;
  });

  const nextWaitingQueue = queues.find((q) => q.status === 'waiting');
  const currentlyServing = queues.find((q) => q.status === 'serving') || queues.find((q) => q.status === 'called');

  const filterTabs = [
    { id: 'all', label: 'Semua', count: queues.length },
    { id: 'waiting', label: 'Menunggu', count: queues.filter((q) => q.status === 'waiting').length },
    { id: 'serving', label: 'Sedang Dilayani', count: queues.filter((q) => q.status === 'serving' || q.status === 'called').length },
    { id: 'completed', label: 'Selesai', count: queues.filter((q) => q.status === 'completed').length },
    { id: 'skipped', label: 'Dilewati', count: queues.filter((q) => q.status === 'skipped').length },
    { id: 'cancelled', label: 'Dibatalkan', count: queues.filter((q) => q.status === 'cancelled').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Kelola Antrean Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Panggil, layani, selesaikan, atau atur antrean operasional hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCallNext}
            disabled={isCallingNext || !nextWaitingQueue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-card transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isCallingNext ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BellRing size={18} />
            )}
            Panggil Berikutnya {nextWaitingQueue ? `(${nextWaitingQueue.queue_number})` : ''}
          </button>

          <Link
            to="/ambil-antrean"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
            title="Tambah Antrean Manual dari Customer Form"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Tambah Tiket</span>
          </Link>
        </div>
      </div>

      {/* Serving Notice Box */}
      {currentlyServing && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16865B] text-white flex items-center justify-center font-mono font-bold text-base flex-shrink-0">
              {currentlyServing.queue_number}
            </div>
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#16865B]" />
                Sedang Dilayani di Loket: <strong>{currentlyServing.customer_name}</strong>
              </div>
              <p className="text-emerald-700 mt-0.5">
                Status: <span className="capitalize font-semibold">{currentlyServing.status}</span> • WhatsApp: {currentlyServing.customer_phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentlyServing.status === 'called' && (
              <button
                onClick={() => handleStatusChange(currentlyServing.id, 'serving')}
                className="px-3 py-1.5 rounded-lg bg-[#16865B] text-white font-semibold hover:bg-[#14543D] transition-colors"
              >
                Mulai Layani Sekarang
              </button>
            )}
            {currentlyServing.status === 'serving' && (
              <button
                onClick={() => handleStatusChange(currentlyServing.id, 'completed')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors"
              >
                Tandai Selesai
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-3xl p-4 shadow-card border border-gray-100 space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#16865B] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Cari nomor antrean (misal: A-001) atau nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 rounded-xl"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table Component */}
      <QueueTable
        queues={filteredQueues}
        onStatusChange={handleStatusChange}
        isProcessing={loading}
      />
    </div>
  );
};

