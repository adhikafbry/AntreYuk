import React, { useEffect, useRef, useState } from 'react';
import { CustomerQueueDetail } from '../../types/queue';
import { StatusBadge } from '../common/StatusBadge';
import { playChimeNotification } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  User, 
  Users, 
  Clock, 
  BellRing, 
  AlertCircle, 
  MapPin, 
  Volume2, 
  CheckCircle2, 
  Radio,
  Bell,
  Smartphone
} from 'lucide-react';

interface LiveProgressTrackerProps {
  detail: CustomerQueueDetail;
}

export const LiveProgressTracker: React.FC<LiveProgressTrackerProps> = ({ detail }) => {
  const { queue, store, position_in_front, estimated_wait_minutes, current_serving_number } = detail;
  const prevStatusRef = useRef(queue.status);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [soundTested, setSoundTested] = useState(false);

  // Request native browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification('Notifikasi AntreYuk Aktif', {
            body: `Anda akan mendapatkan pemberitahuan saat nomor ${queue.queue_number} dipanggil.`,
            icon: '/favicon.svg',
          });
        }
      } catch (err) {
        console.warn('Error requesting notification permission:', err);
      }
    }
  };

  // Trigger browser push/popup if granted
  const triggerNativeNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
          requireInteraction: true,
        });
      } catch (e) {
        console.warn('Could not fire browser notification:', e);
      }
    }
  };

  // Audio, Confetti, Vibration, and Tab Blinking effect when status changes
  useEffect(() => {
    let blinkInterval: ReturnType<typeof setInterval> | null = null;
    const originalTitle = document.title;

    if (queue.status === 'called') {
      // 1. Audio chime bell
      playChimeNotification();

      // 2. Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // 3. Vibration API for mobile smartphones
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([300, 150, 300, 150, 500]);
        } catch {
          // ignore
        }
      }

      // 4. Native Browser Desktop/Mobile Popup
      triggerNativeNotification(
        `🔔 Nomor Antrean ${queue.queue_number} Dipanggil!`,
        `Silakan menuju ke loket pelayanan ${store.name} sekarang!`
      );

      // 5. Blinking Browser Tab Title (visible even when switching tabs)
      let toggle = false;
      blinkInterval = setInterval(() => {
        document.title = toggle
          ? `🔔 (DIPANGGIL!) Nomor ${queue.queue_number}`
          : `Segera ke Loket! - AntreYuk`;
        toggle = !toggle;
      }, 1000);
    } else if (queue.status === 'serving') {
      playChimeNotification();
      triggerNativeNotification(
        `Pelayanan Dimulai: ${queue.queue_number}`,
        `Nomor antrean Anda saat ini sedang dilayani di loket.`
      );
    } else {
      document.title = `${queue.queue_number} - Pantau Antrean | AntreYuk`;
    }

    prevStatusRef.current = queue.status;

    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
      document.title = originalTitle;
    };
  }, [queue.status, queue.queue_number, store.name]);

  // Compute progress percentage
  const getProgressPercentage = () => {
    if (queue.status === 'completed') return 100;
    if (queue.status === 'serving') return 90;
    if (queue.status === 'called') return 80;
    if (queue.status === 'cancelled' || queue.status === 'skipped') return 0;

    // waiting
    const totalAheadInitial = Math.max(position_in_front + 1, 1);
    const progress = Math.max(10, Math.min(75, 100 - (position_in_front / totalAheadInitial) * 80));
    return progress;
  };

  const progressPercent = getProgressPercentage();
  const isNearTurn = queue.status === 'waiting' && position_in_front > 0 && position_in_front <= 3;
  const isCalled = queue.status === 'called';
  const isServing = queue.status === 'serving';

  const handleTestSound = () => {
    playChimeNotification();
    setSoundTested(true);
    setTimeout(() => setSoundTested(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full">
      {/* Live Sync Active Pill + Notification Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
          </span>
          <span className="font-semibold text-gray-700 flex items-center gap-1">
            <Radio size={14} className="text-[#16865B]" />
            Live Real-Time Monitoring
          </span>
        </div>

        {/* Quick notification actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {notificationPermission !== 'granted' && typeof window !== 'undefined' && 'Notification' in window && (
            <button
              onClick={requestNotificationPermission}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-blue-200"
              title="Aktifkan notifikasi browser agar tetap tahu saat membuka tab lain"
            >
              <Bell size={12} />
              Izinkan Notifikasi Tab
            </button>
          )}

          <button
            onClick={handleTestSound}
            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
            title="Uji bunyi lonceng panggilan"
          >
            <Volume2 size={12} className={soundTested ? 'text-[#16865B]' : ''} />
            {soundTested ? 'Bunyi Berbunyi!' : 'Tes Suara'}
          </button>
        </div>
      </div>

      {/* High-Priority In-Page Notification Alerts */}
      {isCalled && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 shadow-elevated border border-blue-400 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
              <BellRing size={32} className="animate-bounce text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  🔔 GILIRAN ANDA TIBA!
                </span>
                <span className="text-xs flex items-center gap-1 opacity-90 font-medium">
                  <Volume2 size={14} /> Bunyi & Getar Aktif
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mt-2">
                Nomor {queue.queue_number} Sedang Dipanggil!
              </h3>
              <p className="mt-1.5 text-sm text-blue-100 leading-relaxed font-medium">
                Silakan langsung menuju ke loket pelayanan <strong>{store.name}</strong> sekarang. Petugas siap melayani Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {isNearTurn && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-5 shadow-card animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h4 className="text-base font-bold">
                Giliran Anda Semakin Dekat ({position_in_front} orang lagi di depanmu)
              </h4>
              <p className="text-xs text-amber-100 mt-1 leading-relaxed">
                Harap bersiap dan pastikan Anda sudah berada di dekat lokasi toko agar tidak terlewat saat nomor Anda dipanggil.
              </p>
            </div>
          </div>
        </div>
      )}

      {isServing && (
        <div className="bg-[#14543D] text-white rounded-3xl p-5 shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
              <CheckCircle2 size={24} className="text-emerald-300" />
            </div>
            <div>
              <h4 className="text-base font-bold">
                Nomor Anda Sedang Dilayani di Loket
              </h4>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Pelayanan sedang berlangsung. Terima kasih telah antre dengan tertib.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Dual Grid: Sedang Dilayani vs Nomor Antrean Saya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Sedang Dilayani */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#16865B]" />
              Nomor Sedang Dilayani
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="text-5xl sm:text-6xl font-black text-[#16865B] font-mono tracking-tight my-2">
            {current_serving_number || '-'}
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Loket Pelayanan Utama</span>
            <span className="font-medium text-gray-700">{store.name}</span>
          </div>
        </div>

        {/* Card 2: Nomor Antrean Saya */}
        <div className={`text-white rounded-3xl p-6 shadow-card flex flex-col justify-between relative overflow-hidden transition-all ${
          isCalled ? 'bg-gradient-to-br from-blue-600 to-indigo-700 ring-4 ring-blue-300' : 'bg-gradient-to-br from-[#16865B] to-[#14543D]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <User size={14} />
              Nomor Antrean Saya
            </span>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full text-white">
              {queue.customer_name}
            </span>
          </div>

          <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight my-2">
            {queue.queue_number}
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-emerald-100">Status Saat Ini</span>
            <StatusBadge status={queue.status} size="sm" />
          </div>
        </div>
      </div>

      {/* Live Position & Estimated Wait Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Posisi Antrean */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF8] border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Posisi Antrean
              </span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {queue.status === 'waiting' ? (
                  position_in_front === 0 ? (
                    <span className="text-[#16865B]">Giliran Anda berikutnya!</span>
                  ) : (
                    <span>{position_in_front} pelanggan di depanmu</span>
                  )
                ) : queue.status === 'called' ? (
                  <span className="text-blue-600">Nomor Anda Dipanggil</span>
                ) : queue.status === 'serving' ? (
                  <span className="text-[#16865B]">Sedang Dilayani</span>
                ) : (
                  <span className="capitalize">{queue.status}</span>
                )}
              </span>
            </div>
          </div>

          {/* Estimasi Waktu Tunggu */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAF8] border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Estimasi Waktu Tunggu
              </span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {queue.status === 'waiting' ? (
                  estimated_wait_minutes <= 0 ? (
                    <span className="text-[#16865B]">Kurang dari 2 menit</span>
                  ) : (
                    <span>Sekitar {estimated_wait_minutes} menit</span>
                  )
                ) : (
                  <span>Tepat Waktu</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Perkembangan Antrean</span>
            <span className="font-mono text-[#16865B]">{Math.round(progressPercent)}%</span>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#16865B] to-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span>Ambil Tiket</span>
            <span>Menunggu</span>
            <span>Dipanggil</span>
            <span>Dilayani</span>
            <span>Selesai</span>
          </div>
        </div>

        {/* Multi-Channel Notification Features Summary */}
        <div className="p-4 rounded-2xl bg-[#E8F5EE]/70 border border-[#16865B]/20 space-y-2 text-xs text-[#14543D]">
          <div className="font-bold flex items-center gap-2">
            <BellRing size={16} className="text-[#16865B]" />
            Penanda & Notifikasi Otomatis yang Aktif:
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16865B]" />
              <strong>Suara Lonceng Loket:</strong> Berbunyi otomatis saat giliran dipanggil.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16865B]" />
              <strong>Kedipan Tab Browser:</strong> Judul tab berkedip `🔔 (DIPANGGIL!)`.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16865B]" />
              <strong>Getaran HP (Mobile):</strong> Bergetar saat nomor Anda dipanggil petugas.
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16865B]" />
              <strong>Peringatan Dini:</strong> Banner oranye muncul saat tersisa 3 orang lagi.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
