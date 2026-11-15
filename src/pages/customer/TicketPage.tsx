import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CustomerQueueDetail } from '../../types/queue';
import { getCustomerQueueDetail, cancelCustomerQueue, subscribeToQueueUpdates } from '../../services/queueService';
import { DigitalTicket } from '../../components/customer/DigitalTicket';
import { Modal } from '../../components/common/Modal';
import { ArrowLeft, TicketX } from 'lucide-react';

export const TicketPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [detail, setDetail] = useState<CustomerQueueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDetail = async () => {
    if (!token) return;
    try {
      const data = await getCustomerQueueDetail(token);
      setDetail(data);
    } catch (err) {
      console.error('Error fetching ticket detail:', err);
    } finally {
      setLoading(false);
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

  const handleConfirmCancel = async () => {
    if (!token) return;
    try {
      setIsCancelling(true);
      await cancelCustomerQueue(token);
      setShowCancelModal(false);
      await fetchDetail();
    } catch (err) {
      console.error('Error cancelling queue:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#16865B] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-gray-600">Memuat Tiket Digital Anda...</span>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-16 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <TicketX size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tiket Tidak Ditemukan</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Tautan tiket antrean tidak valid atau sudah kedaluwarsa. Pastikan tautan yang Anda masukkan benar.
        </p>
        <div className="pt-4">
          <Link
            to="/ambil-antrean"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16865B] text-white font-semibold text-sm hover:bg-[#14543D]"
          >
            Ambil Nomor Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#16865B] transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      <DigitalTicket
        queue={detail.queue}
        store={detail.store}
        onCancelRequest={() => setShowCancelModal(true)}
        isCancelling={isCancelling}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Batalkan Nomor Antrean?"
        message={`Apakah Anda yakin ingin membatalkan antrean nomor ${detail.queue.queue_number}? Jika dibatalkan, nomor ini tidak dapat digunakan kembali.`}
        confirmText="Ya, Batalkan Antrean"
        cancelText="Kembali"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};

