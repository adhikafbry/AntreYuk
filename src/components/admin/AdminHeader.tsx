import React, { useState } from 'react';
import { Store } from '../../types/queue';
import { Menu, Power, ExternalLink, RefreshCw } from 'lucide-react';
import { updateStoreSettings } from '../../services/storeService';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  store: Store | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  store,
  onRefresh,
  isRefreshing = false,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleToggleStoreOpen = async () => {
    if (!store) return;
    try {
      setIsUpdatingStatus(true);
      await updateStoreSettings(store.id, {
        is_open: !store.is_open,
      });
    } catch (err) {
      console.error('Error toggling store status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isOpen = store?.is_open ?? true;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 h-20 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <span>{store?.name || 'Apotek AntreYuk Sehat'}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isOpen ? 'Toko Buka' : 'Toko Tutup'}
            </span>
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Sistem Antrean Digital Real-Time Loket Tunggal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200/80 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#16865B]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Quick Open/Close Store Toggle */}
        <button
          onClick={handleToggleStoreOpen}
          disabled={isUpdatingStatus || !store}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 ${
            isOpen
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Power size={14} />
          <span className="hidden sm:inline">
            {isOpen ? 'Tutup Toko Sementara' : 'Buka Toko Sekarang'}
          </span>
          <span className="sm:hidden">
            {isOpen ? 'Tutup' : 'Buka'}
          </span>
        </button>

        {/* Direct Link to Customer Site */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#16865B] bg-[#E8F5EE] hover:bg-[#16865B] hover:text-white transition-all shadow-sm"
        >
          <ExternalLink size={14} />
          Website Pelanggan
        </a>
      </div>
    </header>
  );
};

