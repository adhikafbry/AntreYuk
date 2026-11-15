import React from 'react';
import { Smartphone, Eye, Coffee, CheckCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Ambil Nomor Antrean',
      description: 'Cukup masukkan nama dan nomor WhatsApp Anda secara online tanpa perlu datang langsung lebih awal.',
      icon: <Smartphone className="w-6 h-6 text-[#16865B]" />,
    },
    {
      step: '02',
      title: 'Pantau Real-Time',
      description: 'Lihat posisi antrean, nomor yang sedang dilayani, dan estimasi waktu tunggu langsung dari browser Anda.',
      icon: <Eye className="w-6 h-6 text-[#16865B]" />,
    },
    {
      step: '03',
      title: 'Lakukan Aktivitas Lain',
      description: 'Gunakan waktu Anda untuk bekerja, belanja, santai ngopi, atau urusan lain dengan tenang tanpa rasa khawatir.',
      icon: <Coffee className="w-6 h-6 text-[#16865B]" />,
    },
    {
      step: '04',
      title: 'Kembali Saat Giliran Tiba',
      description: 'Dapatkan pemberitahuan saat nomor Anda mendekati giliran dan langsung dilayani di toko tanpa membuang waktu.',
      icon: <CheckCheck className="w-6 h-6 text-[#16865B]" />,
    },
  ];

  return (
    <section id="cara-kerja" className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#16865B] bg-[#E8F5EE] px-3.5 py-1.5 rounded-full inline-block mb-3">
            Mudah & Efisien
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Bagaimana AntreYuk Bekerja?
          </h2>
          <p className="mt-4 text-base text-[#6B7280]">
            Empat langkah sederhana untuk antre pintar tanpa menghabiskan waktu menunggu di tempat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-card hover:shadow-elevated transition-all flex flex-col relative group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-2xl font-black text-gray-200 group-hover:text-[#16865B]/30 transition-colors font-mono">
                  {item.step}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1F2937] mb-2.5">
                {item.title}
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed flex-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

