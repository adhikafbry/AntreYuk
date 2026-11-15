import React from 'react';
import { Logo } from './Logo';
import { Store } from '../../types/queue';
import { MapPin, Phone, Clock, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  store?: Store | null;
}

export const Footer: React.FC<FooterProps> = ({ store }) => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showTagline={true} />
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-md">
              AntreYuk adalah solusi antrean digital modern untuk toko mandiri. Membantu pelanggan menghemat waktu berharga mereka tanpa perlu menunggu secara fisik di lokasi.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#16865B] bg-[#E8F5EE] px-3 py-1 rounded-full font-medium">
                <Heart size={13} className="text-[#16865B] fill-current" />
                Antre tanpa harus menunggu di tempat!
              </span>
            </div>
          </div>

          {/* Store information */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1F2937] tracking-wider uppercase">
              Informasi Toko
            </h4>
            <div className="space-y-2.5 text-sm text-[#6B7280]">
              <p className="font-semibold text-gray-800">
                {store?.name || 'Apotek AntreYuk Sehat'}
              </p>
              <p className="flex items-start gap-2 text-xs leading-relaxed">
                <MapPin size={16} className="text-[#16865B] flex-shrink-0 mt-0.5" />
                <span>{store?.address || 'Jl. Kesehatan Raya No. 45, Jakarta Pusat'}</span>
              </p>
              <p className="flex items-center gap-2 text-xs">
                <Clock size={16} className="text-[#16865B] flex-shrink-0" />
                <span>Buka: {store?.opening_time || '08:00'} - {store?.closing_time || '21:00'} WIB</span>
              </p>
            </div>
          </div>

          {/* Contact & Admin link */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1F2937] tracking-wider uppercase">
              Kontak & Bantuan
            </h4>
            <div className="space-y-2.5 text-sm text-[#6B7280]">
              <p className="flex items-center gap-2 text-xs">
                <Phone size={16} className="text-[#16865B] flex-shrink-0" />
                <span>{store?.phone || '0812-3456-7890'}</span>
              </p>
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#16865B] bg-gray-50 hover:bg-[#E8F5EE] px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                >
                  <ShieldCheck size={14} />
                  Login Pengelola Toko
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>© {new Date().getFullYear()} AntreYuk. Seluruh hak cipta dilindungi.</p>
          <p className="text-gray-400">
            Dibuat untuk pengalaman antrean pelanggan yang nyaman dan transparan.
          </p>
        </div>
      </div>
    </footer>
  );
};

