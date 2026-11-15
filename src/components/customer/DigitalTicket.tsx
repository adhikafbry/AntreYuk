import React, { useState } from 'react';
import { QueueItem, Store } from '../../types/queue';
import { StatusBadge } from '../common/StatusBadge';
import { Logo } from '../common/Logo';
import { Eye, XCircle, Share2, Copy, Check, Clock, Calendar, Store as StoreIcon, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DigitalTicketProps {
  queue: QueueItem;
  store: Store;
  onCancelRequest?: () => void;
  isCancelling?: boolean;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({
  queue,
  store,
  onCancelRequest,
  isCancelling = false,
}) => {
  const [copied, setCopied] = useState(false);

  const monitorUrl = `${window.location.origin}/antrean/${queue.access_token}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(monitorUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Nomor Antrean ${queue.queue_number} - ${store.name}`,
        text: `Pantau antrean saya nomor ${queue.queue_number} di ${store.name} secara real-time!`,
        url: monitorUrl,
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  const formattedTime = new Date(queue.created_at).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = new Date(queue.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const canCancel = queue.status === 'waiting';

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Physical Ticket Style Card */}
      <div className="bg-white rounded-3xl shadow-elevated border border-gray-100 overflow-hidden relative">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-[#14543D] to-[#16865B] p-6 text-white text-center relative">
          <div className="flex justify-center mb-3">
            <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
              <Logo size="sm" linkToHome={false} className="text-white" />
            </div>
          </div>
          <h2 className="text-lg font-bold tracking-tight">
            {store.name}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 flex items-center justify-center gap-1">
            <StoreIcon size={13} />
            {store.address}
          </p>
        </div>

        {/* Tear-off Notches (Ticket cutout effect) */}
        <div className="relative flex items-center justify-between px-3 py-1 bg-white">
          <div className="w-6 h-6 bg-[#F8FAF8] rounded-full -ml-6 border-r border-gray-100" />
          <div className="flex-1 border-b-2 border-dashed border-gray-200 mx-2" />
          <div className="w-6 h-6 bg-[#F8FAF8] rounded-full -mr-6 border-l border-gray-100" />
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 text-center space-y-6">
          {/* Customer Name */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <User size={14} className="text-[#16865B]" />
            {queue.customer_name}
          </div>

          {/* Big Queue Number */}
          <div className="py-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
              Nomor Antrean Anda
            </div>
            <div className="text-6xl sm:text-7xl font-black text-[#16865B] tracking-tight font-mono">
              {queue.queue_number}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <StatusBadge status={queue.status} size="lg" />
          </div>

          {/* Ticket Meta Details */}
          <div className="bg-[#F8FAF8] rounded-2xl p-4 border border-gray-100 text-xs text-gray-600 grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <Clock size={12} /> Waktu Ambil
              </span>
              <span className="font-semibold text-gray-800">{formattedTime} WIB</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                <Calendar size={12} /> Tanggal
              </span>
              <span className="font-semibold text-gray-800 truncate block">{formattedDate}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200/60 flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <Phone size={12} /> WhatsApp
              </span>
              <span className="font-semibold text-gray-800">{queue.customer_phone}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              to={`/antrean/${queue.access_token}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-card transition-all"
            >
              <Eye size={18} />
              Pantau Antrean Real-Time
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
              >
                {copied ? <Check size={14} className="text-[#16865B]" /> : <Share2 size={14} />}
                {copied ? 'Tautan Tersalin!' : 'Bagikan Tautan'}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Salin Tautan Tiket"
              >
                {copied ? <Check size={16} className="text-[#16865B]" /> : <Copy size={16} />}
              </button>
            </div>

            {canCancel && onCancelRequest && (
              <button
                type="button"
                onClick={onCancelRequest}
                disabled={isCancelling}
                className="w-full text-xs font-semibold text-rose-600 hover:text-rose-700 py-2 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <XCircle size={14} />
                Batalkan Antrean
              </button>
            )}
          </div>

          {/* Informational Help Note */}
          <div className="text-[11px] text-gray-400 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
            💡 <strong>Simpan halaman ini:</strong> Anda dapat memantau giliran Anda kapan saja melalui tautan ini tanpa perlu membuat akun atau login.
          </div>
        </div>
      </div>
    </div>
  );
};

