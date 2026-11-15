import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Menu, X, Ticket, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Logo size="md" showTagline={false} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isCurrent('/') ? 'text-[#16865B]' : 'text-gray-600 hover:text-[#16865B]'
              }`}
            >
              Beranda
            </Link>
            <a
              href="/#cara-kerja"
              className="text-sm font-semibold text-gray-600 hover:text-[#16865B] transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="/#info-antrean"
              className="text-sm font-semibold text-gray-600 hover:text-[#16865B] transition-colors"
            >
              Informasi Antrean
            </a>
            <Link
              to="/admin"
              className="text-xs font-medium text-gray-500 hover:text-[#16865B] flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-gray-50 transition-colors"
              title="Dashboard Pengelola Toko"
            >
              <ShieldCheck size={14} className="text-gray-400" />
              Kelola Toko
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/ambil-antrean"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16865B] text-white font-semibold text-sm hover:bg-[#14543D] active:scale-95 shadow-card transition-all"
            >
              <Ticket size={18} />
              Ambil Antrean
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/ambil-antrean"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16865B] text-white font-medium text-xs shadow-sm"
            >
              <Ticket size={14} />
              Antre
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-5 space-y-3 shadow-lg animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isCurrent('/') ? 'text-[#16865B]' : 'text-gray-700'
            }`}
          >
            Beranda
          </Link>
          <a
            href="/#cara-kerja"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-700 hover:text-[#16865B]"
          >
            Cara Kerja
          </a>
          <a
            href="/#info-antrean"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-gray-700 hover:text-[#16865B]"
          >
            Informasi Antrean
          </a>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-600 flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            Dashboard Admin
          </Link>

          <div className="pt-2">
            <Link
              to="/ambil-antrean"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16865B] text-white font-semibold text-center shadow-card"
            >
              <Ticket size={18} />
              Ambil Nomor Antrean
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

