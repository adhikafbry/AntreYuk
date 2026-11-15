import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Store, QueueItem, AdminUser, QueueStatus } from '../../types/queue';
import { QueueTable } from '../../components/admin/QueueTable';
import { getAdminQueues, updateQueueStatus } from '../../services/queueService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Users, 
  FileText 
} from 'lucide-react';

export const AdminQueueHistoryPage: React.FC = () => {
  const { store } = useOutletContext<{ store: Store | null; adminUser: AdminUser | null }>();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async (dateStr: string) => {
    try {
      setLoading(true);
      const data = await getAdminQueues(store?.id || DEFAULT_STORE_ID, dateStr);
      setQueues(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(selectedDate);
  }, [selectedDate, store?.id]);

  const handleStatusChange = async (queueId: string, status: QueueStatus) => {
    await updateQueueStatus(queueId, status, store?.id || DEFAULT_STORE_ID);
    await loadHistory(selectedDate);
  };

  // Filter & Search
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

  // Calculate day metrics
  const totalCount = queues.length;
  const completedCount = queues.filter((q) => q.status === 'completed').length;
  const skippedCount = queues.filter((q) => q.status === 'skipped').length;
  const cancelledCount = queues.filter((q) => q.status === 'cancelled').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Date Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Riwayat Antrean Harian
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Laporan dan rekaman antrean berdasarkan tanggal operasional.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-200">
          <Calendar size={18} className="text-[#16865B]" />
          <span className="text-xs font-semibold text-gray-500">Tanggal:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs sm:text-sm font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Historical Summary Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Total Antrean</span>
            <span className="text-2xl font-black text-gray-900 font-mono">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16865B] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Sukses Selesai</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{completedCount} ({completionRate}%)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <RotateCcw size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Dilewati</span>
            <span className="text-2xl font-black text-orange-700 font-mono">{skippedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle size={22} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 block uppercase">Dibatalkan</span>
            <span className="text-2xl font-black text-rose-700 font-mono">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-card border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
        {/* Status Dropdown */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16865B]"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="waiting">Menunggu</option>
            <option value="serving">Sedang Dilayani</option>
            <option value="skipped">Dilewati</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari nomor antrean atau nama pelanggan di riwayat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
          />
        </div>
      </div>

      {/* Queue Table */}
      <QueueTable
        queues={filteredQueues}
        onStatusChange={handleStatusChange}
        isProcessing={loading}
      />
    </div>
  );
};

