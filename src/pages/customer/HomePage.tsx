import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Store, QueueStats } from '../../types/queue';
import { QueueStatusCard } from '../../components/customer/QueueStatusCard';
import { HowItWorks } from '../../components/customer/HowItWorks';
import { Benefits } from '../../components/customer/Benefits';
import { getPublicQueueStats, subscribeToQueueUpdates } from '../../services/queueService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { Ticket, Eye, Clock, ShieldCheck, Sparkles, ArrowDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { store } = useOutletContext<{ store: Store | null }>();
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await getPublicQueueStats(DEFAULT_STORE_ID);
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const unsubscribe = subscribeToQueueUpdates(DEFAULT_STORE_ID, () => {
      fetchStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const scrollToInfo = () => {
    const el = document.getElementById('info-antrean');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E8F5EE] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5EE] text-[#14543D] text-xs sm:text-sm font-semibold shadow-sm border border-[#16865B]/20">
            <Sparkles size={15} className="text-[#16865B]" />
            Single-Store Real-Time Queue System
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#1F2937] tracking-tight leading-[1.15]">
            Waktumu Terlalu Berharga untuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16865B] to-emerald-500">
              Sekadar Menunggu.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-[#6B7280] leading-relaxed">
            Ambil nomor antreanmu, pantau secara real-time, dan lakukan aktivitas lain tanpa takut kehilangan giliran.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/ambil-antrean"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#16865B] text-white font-bold text-base hover:bg-[#14543D] active:scale-95 shadow-elevated transition-all"
            >
              <Ticket size={20} />
              Ambil Nomor Antrean
            </Link>

            <button
              onClick={scrollToInfo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 border border-gray-200 shadow-sm transition-all"
            >
              <Eye size={18} className="text-[#16865B]" />
              Lihat Antrean Saat Ini
              <ArrowDown size={16} />
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#16865B]" /> Update Real-time
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#16865B]" /> Tanpa Perlu Daftar Akun
            </span>
            <span className="flex items-center gap-1.5">
              <Ticket size={14} className="text-[#16865B]" /> Tiket Digital Unik
            </span>
          </div>
        </div>
      </section>

      {/* QUEUE INFORMATION CARD SECTION */}
      <section id="info-antrean" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F2937]">
              Kondisi Antrean Terkini
            </h2>
            <p className="text-xs text-[#6B7280]">
              Informasi langsung dari loket pelayanan {store?.name || 'toko'}
            </p>
          </div>
        </div>

        <QueueStatusCard
          store={store}
          stats={stats}
          isLoading={loadingStats}
        />
      </section>

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* BENEFIT SECTION */}
      <Benefits />
    </div>
  );
};

