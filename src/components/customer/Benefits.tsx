import React from 'react';
import { Timer, Radio, BatteryCharging, ShieldCheck } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      title: 'Tidak Perlu Menunggu di Tempat',
      description: 'Lupakan berdiri berlama-lama di ruang tunggu yang padat. Anda bebas berada di mana saja sambil menunggu nomor Anda dipanggil.',
      icon: <Timer className="w-7 h-7 text-[#16865B]" />,
    },
    {
      title: 'Pantau Antrean Kapan Saja',
      description: 'Cukup buka tautan tiket di browser smartphone Anda. Sinkronisasi real-time memastikan nomor berjalan transparan setiap detik.',
      icon: <Radio className="w-7 h-7 text-[#16865B]" />,
    },
    {
      title: 'Hemat Waktu dan Tenaga',
      description: 'Gunakan waktu berharga Anda untuk hal penting lain. Datanglah ke toko tepat saat nomor Anda siap untuk dilayani.',
      icon: <BatteryCharging className="w-7 h-7 text-[#16865B]" />,
    },
    {
      title: 'Bebas Ribet Tanpa Bikin Akun',
      description: 'Cukup masukkan nama dan nomor WhatsApp, Anda langsung mendapatkan tiket digital dengan tautan unik yang aman.',
      icon: <ShieldCheck className="w-7 h-7 text-[#16865B]" />,
    },
  ];

  return (
    <section className="py-16 bg-[#E8F5EE]/40 border-y border-[#16865B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16865B] bg-white px-3.5 py-1.5 rounded-full inline-block mb-3 shadow-sm border border-[#16865B]/20">
            Nilai Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Kenapa Menggunakan AntreYuk?
          </h2>
          <p className="mt-4 text-base text-[#6B7280]">
            Sistem antrean cerdas yang dirancang untuk memanusiakan waktu pelanggan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-card transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E8F5EE] flex items-center justify-center mb-5">
                {benefit.icon}
              </div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">
                {benefit.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

