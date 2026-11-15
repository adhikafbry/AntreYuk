import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Store, AdminUser } from '../../types/queue';
import { updateStoreSettings } from '../../services/storeService';
import { DEFAULT_STORE_ID } from '../../services/mockStorage';
import { 
  Store as StoreIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  Sliders, 
  FileText 
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { store, refreshData } = useOutletContext<{ 
    store: Store | null; 
    adminUser: AdminUser | null;
    refreshData: () => Promise<void>;
  }>();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const [isOpen, setIsOpen] = useState(true);
  const [averageDuration, setAverageDuration] = useState(5);
  const [dailyLimit, setDailyLimit] = useState(150);
  const [acceptingQueue, setAcceptingQueue] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (store) {
      setName(store.name || '');
      setDescription(store.description || '');
      setAddress(store.address || '');
      setPhone(store.phone || '');
      setOpeningTime(store.opening_time || '08:00');
      setClosingTime(store.closing_time || '21:00');
      setIsOpen(store.is_open ?? true);
      setAverageDuration(store.average_service_duration || 5);
      setDailyLimit(store.daily_queue_limit || 150);
      setAcceptingQueue(store.accepting_queue ?? true);
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      await updateStoreSettings(store?.id || DEFAULT_STORE_ID, {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        opening_time: openingTime,
        closing_time: closingTime,
        is_open: isOpen,
        average_service_duration: Number(averageDuration) || 5,
        daily_queue_limit: Number(dailyLimit) || 150,
        accepting_queue: acceptingQueue,
      });

      setSuccessMessage('Pengaturan toko berhasil disimpan dan diperbarui!');
      await refreshData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan toko.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Pengaturan Toko & Layanan Antrean
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Kelola profil toko, jam operasional, durasi pelayanan, dan kuota antrean harian.
        </p>
      </div>

      {/* Feedback Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-fadeIn">
          <CheckCircle2 size={20} className="text-[#16865B] flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm animate-fadeIn">
          <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Toko */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-[#E8F5EE] text-[#16865B]">
              <StoreIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Profil & Identitas Toko
              </h2>
              <p className="text-xs text-gray-400">
                Ditampilkan pada website pelanggan dan tiket antrean
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nama Toko */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Nama Toko / Apotek
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Apotek AntreYuk Sehat"
                className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
              />
            </div>

            {/* Deskripsi Toko */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Deskripsi Singkat Toko
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi layanan toko..."
                className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Alamat Fisik Toko
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Kesehatan Raya No. 45..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
                />
              </div>
            </div>

            {/* Nomor Kontak WhatsApp / Telp */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Nomor Kontak Layanan / CS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Operasional & Jam Buka */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Jam Operasional & Status Toko
              </h2>
              <p className="text-xs text-gray-400">
                Kontrol kapan pelanggan dapat mengambil antrean
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Jam Buka */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Jam Buka Toko
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
              />
            </div>

            {/* Jam Tutup */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Jam Tutup Toko
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
              />
            </div>

            {/* Toggle Status Buka/Tutup */}
            <div className="sm:col-span-2 flex items-center justify-between p-4 bg-[#F8FAF8] rounded-2xl border border-gray-100">
              <div>
                <span className="font-bold text-sm text-gray-900 block">
                  Status Operasional Toko
                </span>
                <span className="text-xs text-gray-500">
                  {isOpen ? 'Toko buka dan melayani pengunjung' : 'Toko ditutup (pelanggan tidak bisa ambil tiket baru)'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16865B]" />
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Pengaturan Antrean & Estimasi */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gray-100 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Logika Antrean & Batas Harian
              </h2>
              <p className="text-xs text-gray-400">
                Konfigurasi durasi pelayanan dan kuota tiket per hari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Rata-rata Durasi Pelayanan */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Rata-rata Durasi Pelayanan (Menit)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={averageDuration}
                  onChange={(e) => setAverageDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
                />
                <span className="absolute right-4 top-3 text-xs text-gray-400 font-medium">
                  menit/orang
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Digunakan untuk menghitung estimasi waktu tunggu otomatis pada monitor pelanggan.
              </p>
            </div>

            {/* Batas Maksimal Harian */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Batas Maksimal Antrean Harian
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  required
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#F8FAF8] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16865B]"
                />
                <span className="absolute right-4 top-3 text-xs text-gray-400 font-medium">
                  tiket/hari
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Sistem akan menghentikan penerimaan tiket baru jika batas tercapai.
              </p>
            </div>

            {/* Toggle Terima Antrean */}
            <div className="sm:col-span-2 flex items-center justify-between p-4 bg-[#F8FAF8] rounded-2xl border border-gray-100">
              <div>
                <span className="font-bold text-sm text-gray-900 block">
                  Penerimaan Nomor Antrean
                </span>
                <span className="text-xs text-gray-500">
                  {acceptingQueue ? 'Menerima antrean baru dari website pelanggan' : 'Penerimaan ditangguhkan sementara (misal istirahat)'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptingQueue}
                  onChange={(e) => setAcceptingQueue(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16865B]" />
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#16865B] text-white font-bold text-sm hover:bg-[#14543D] active:scale-95 shadow-card transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menyimpan Perubahan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

