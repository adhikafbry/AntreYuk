import React, { useState } from 'react';
import { QueueItem, QueueStatus } from '../../types/queue';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { 
  BellRing, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  MessageSquare, 
  Clock, 
  User, 
  Phone,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueueTableProps {
  queues: QueueItem[];
  onStatusChange: (queueId: string, status: QueueStatus) => Promise<void>;
  isProcessing?: boolean;
}

export const QueueTable: React.FC<QueueTableProps> = ({
  queues,
  onStatusChange,
  isProcessing = false,
}) => {
  // Modal state for confirmation
  const [activeModal, setActiveModal] = useState<{
    queueId: string;
    queueNumber: string;
    action: QueueStatus;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary';
    confirmText: string;
  } | null>(null);

  const [loadingAction, setLoadingAction] = useState(false);

  const handleActionClick = (queue: QueueItem, targetStatus: QueueStatus) => {
    if (targetStatus === 'cancelled') {
      setActiveModal({
        queueId: queue.id,
        queueNumber: queue.queue_number,
        action: 'cancelled',
        title: `Batalkan Antrean ${queue.queue_number}?`,
        message: `Apakah Anda yakin ingin membatalkan antrean atas nama ${queue.customer_name}? Tindakan ini tidak dapat dibatalkan.`,
        variant: 'danger',
        confirmText: 'Ya, Batalkan',
      });
      return;
    }

    if (targetStatus === 'skipped') {
      setActiveModal({
        queueId: queue.id,
        queueNumber: queue.queue_number,
        action: 'skipped',
        title: `Lewati Antrean ${queue.queue_number}?`,
        message: `Pelanggan ${queue.customer_name} tidak hadir saat dipanggil. Antrean akan ditandai dilewati.`,
        variant: 'warning',
        confirmText: 'Ya, Lewati',
      });
      return;
    }

    if (targetStatus === 'completed') {
      setActiveModal({
        queueId: queue.id,
        queueNumber: queue.queue_number,
        action: 'completed',
        title: `Selesaikan Pelayanan ${queue.queue_number}?`,
        message: `Konfirmasi bahwa pelayanan untuk ${queue.customer_name} telah selesai dengan baik.`,
        variant: 'primary',
        confirmText: 'Selesaikan Pelayanan',
      });
      return;
    }

    // Direct actions (panggil ulang / mulai pelayanan)
    executeAction(queue.id, targetStatus);
  };

  const executeAction = async (queueId: string, status: QueueStatus) => {
    try {
      setLoadingAction(true);
      await onStatusChange(queueId, status);
      setActiveModal(null);
    } catch (err) {
      console.error('Error changing status:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.substring(1);
    }
    return clean;
  };

  if (queues.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-card">
        <div className="w-16 h-16 bg-[#E8F5EE] text-[#16865B] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock size={32} />
        </div>
        <h3 className="text-lg font-bold text-[#1F2937]">
          Belum Ada Antrean
        </h3>
        <p className="text-sm text-[#6B7280] max-w-sm mx-auto mt-1">
          Belum ada pelanggan yang mengambil nomor antrean pada hari ini. Antrean baru akan muncul secara otomatis.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">No. Antrean</th>
                <th className="py-4 px-6">Pelanggan</th>
                <th className="py-4 px-6">WhatsApp</th>
                <th className="py-4 px-6">Waktu Ambil</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {queues.map((item) => {
                const isWaiting = item.status === 'waiting';
                const isCalled = item.status === 'called';
                const isServing = item.status === 'serving';
                const isFinal = item.status === 'completed' || item.status === 'cancelled' || item.status === 'skipped';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50/80 transition-colors ${
                      isServing ? 'bg-emerald-50/40' : isCalled ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* No. Antrean */}
                    <td className="py-4 px-6 font-mono font-black text-base text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className={isServing ? 'text-[#16865B]' : ''}>
                          {item.queue_number}
                        </span>
                        {isServing && (
                          <span className="w-2 h-2 rounded-full bg-[#16865B] animate-ping" />
                        )}
                      </div>
                    </td>

                    {/* Pelanggan */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <User size={14} className="text-gray-400" />
                        {item.customer_name}
                      </div>
                    </td>

                    {/* WhatsApp */}
                    <td className="py-4 px-6">
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(item.customer_phone)}?text=Halo%20${encodeURIComponent(item.customer_name)},%20ini%20informasi%20mengenai%20antrean%20Anda%20nomor%20${item.queue_number}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                        title="Buka Chat WhatsApp"
                      >
                        <MessageSquare size={13} />
                        {item.customer_phone}
                      </a>
                    </td>

                    {/* Waktu */}
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                      {formatTime(item.created_at)} WIB
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Panggil (waiting / called) */}
                        {(isWaiting || isCalled) && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleActionClick(item, 'called')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors border border-blue-200"
                            title="Panggil Pelanggan"
                          >
                            <BellRing size={13} />
                            {isCalled ? 'Panggil Ulang' : 'Panggil'}
                          </button>
                        )}

                        {/* Tombol Mulai Pelayanan */}
                        {(isWaiting || isCalled) && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleActionClick(item, 'serving')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F5EE] text-[#14543D] hover:bg-[#16865B] hover:text-white font-semibold text-xs transition-colors border border-[#16865B]/20"
                            title="Mulai Melayani"
                          >
                            <Sparkles size={13} />
                            Mulai Layani
                          </button>
                        )}

                        {/* Tombol Selesaikan Pelayanan */}
                        {isServing && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleActionClick(item, 'completed')}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
                            title="Selesaikan Pelayanan"
                          >
                            <CheckCircle2 size={13} />
                            Selesaikan
                          </button>
                        )}

                        {/* Tombol Lewati */}
                        {(isWaiting || isCalled) && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleActionClick(item, 'skipped')}
                            className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                            title="Lewati Antrean"
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}

                        {/* Tombol Batalkan */}
                        {!isFinal && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleActionClick(item, 'cancelled')}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Batalkan Antrean"
                          >
                            <XCircle size={15} />
                          </button>
                        )}

                        {/* Buka Live Monitor Tiket */}
                        <Link
                          to={`/antrean/${item.access_token}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Lihat Tiket Pelanggan"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card-Based Queue List */}
      <div className="lg:hidden space-y-4">
        {queues.map((item) => {
          const isWaiting = item.status === 'waiting';
          const isCalled = item.status === 'called';
          const isServing = item.status === 'serving';
          const isFinal = item.status === 'completed' || item.status === 'cancelled' || item.status === 'skipped';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 shadow-card border border-gray-100 space-y-4 ${
                isServing ? 'ring-2 ring-[#16865B] bg-emerald-50/20' : ''
              }`}
            >
              {/* Card Header: Number & Status */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-[#16865B] font-mono tracking-tight">
                    {item.queue_number}
                  </span>
                  {isServing && (
                    <span className="text-xs font-bold text-[#14543D] bg-[#E8F5EE] px-2 py-0.5 rounded-md">
                      Loket Aktif
                    </span>
                  )}
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              {/* Card Body: Details */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <User size={13} /> Pelanggan
                  </span>
                  <span className="font-semibold text-gray-800">{item.customer_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Phone size={13} /> WhatsApp
                  </span>
                  <a
                    href={`https://wa.me/${cleanPhoneForWhatsApp(item.customer_phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={12} />
                    {item.customer_phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={13} /> Waktu Ambil
                  </span>
                  <span className="font-mono text-gray-700">{formatTime(item.created_at)} WIB</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(isWaiting || isCalled) && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleActionClick(item, 'called')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                    >
                      <BellRing size={13} />
                      {isCalled ? 'Panggil Ulang' : 'Panggil'}
                    </button>
                  )}

                  {(isWaiting || isCalled) && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleActionClick(item, 'serving')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E8F5EE] text-[#14543D] font-semibold text-xs border border-[#16865B]/20"
                    >
                      <Sparkles size={13} />
                      Mulai Layani
                    </button>
                  )}

                  {isServing && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleActionClick(item, 'completed')}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      Selesaikan
                    </button>
                  )}

                  {(isWaiting || isCalled) && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleActionClick(item, 'skipped')}
                      className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-medium"
                      title="Lewati"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}

                  {!isFinal && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleActionClick(item, 'cancelled')}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                      title="Batalkan"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>

                <Link
                  to={`/antrean/${item.access_token}`}
                  target="_blank"
                  className="text-xs text-[#16865B] font-semibold flex items-center gap-1 hover:underline ml-auto"
                >
                  <Eye size={13} />
                  Tiket
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onConfirm={() => executeAction(activeModal.queueId, activeModal.action)}
          title={activeModal.title}
          message={activeModal.message}
          confirmText={activeModal.confirmText}
          variant={activeModal.variant}
          isLoading={loadingAction}
        />
      )}
    </>
  );
};

