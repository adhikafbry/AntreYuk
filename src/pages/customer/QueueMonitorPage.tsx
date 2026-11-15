import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CustomerQueueDetail } from '../../types/queue';
import { getCustomerQueueDetail, subscribeToQueueUpdates } from '../../services/queueService';
import { LiveProgressTracker } from '../../components/customer/LiveProgressTracker';
import { ArrowLeft, Ticket, Search, AlertCircle, RefreshCw } from 'lucide-react';

export const QueueMonitorPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [detail, setDetail] = useState<CustomerQueueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTokenInput, setSearchTokenInput] = useState('');

  const fetchDetail = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setIsRefreshing(true);
      const data = await getCustomerQueueDetail(token);
      setDetail(data);
    } catch (err) {
      console.error('Error fetching live queue detail:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    if (token) {
      const unsub = subscribeToQueueUpdates(detail?.store.id, () => {
        fetchDetail();
      });
      return () => {
        unsub();
      };
    }
  }, [token]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTokenInput.trim()) {
      window.location.href = `/antrean/${searchTokenInput.trim()}`;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#16865B] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-gray-700">Menghubungkan ke Pemantau Antrean Real-Time...</span>
      </div>
    );
  }

  // If user visits /antrean without a token or token not found
  if (!token || !detail) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 text-center space-y-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {token ? 'Tiket Tidak Ditemukan' : 'Pantau Antrean Anda'}
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {token
                ? 'Kami tidak menemukan tiket yang sesuai dengan tautan ini. Silakan masukkan kode tiket Anda atau ambil nomor antrean baru.'
                : 'Masukkan kode akses atau tautan tiket Anda untuk melihat perkembangan antrean secara real-time.'}
            </p>
          </div>

          <form onSubmit={handleManualSearch} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan kode tiket / access token..."
                value={searchTokenInput}
                onChange={(e) => setSearchTokenInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#16865B] text-white font-semibold text-xs rounded-xl hover:bg-[#14543D] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Search size={14} />
              Cari Antrean
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link to="/" className="text-gray-500 hover:text-gray-800">
              Kembali ke Beranda
            </Link>
            <Link to="/ambil-antrean" className="text-[#16865B] font-bold hover:underline">
              Ambil Nomor Antrean Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#16865B] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetail}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors text-xs flex items-center gap-1 disabled:opacity-50"
            title="Perbarui Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#16865B]' : ''} />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>

          <Link
            to={`/tiket/${token}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs transition-colors"
          >
            <Ticket size={14} />
            Lihat Tiket
          </Link>
        </div>
      </div>

      {/* Main Live Progress Component */}
      <LiveProgressTracker detail={detail} />
    </div>
  );
};

