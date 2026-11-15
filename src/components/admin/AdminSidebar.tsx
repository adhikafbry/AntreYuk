import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { signOutAdmin } from '../../services/authService';
import { 
  LayoutDashboard, 
  ListOrdered, 
  History, 
  Settings, 
  LogOut, 
  ExternalLink,
  X 
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  adminEmail,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      end: true,
    },
    {
      to: '/admin/antrean',
      label: 'Kelola Antrean',
      icon: <ListOrdered size={20} />,
      end: false,
    },
    {
      to: '/admin/riwayat',
      label: 'Riwayat Antrean',
      icon: <History size={20} />,
      end: false,
    },
    {
      to: '/admin/pengaturan',
      label: 'Pengaturan Toko',
      icon: <Settings size={20} />,
      end: false,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-gray-100">
            <Logo size="md" linkToHome={false} />
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Menu Utama
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#16865B] text-white shadow-card'
                      : 'text-gray-600 hover:bg-[#E8F5EE]/60 hover:text-[#16865B]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Akses Pelanggan
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink size={18} />
                Lihat Website Pelanggan
              </span>
            </a>
          </nav>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="px-3 py-2 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Login Sebagai
            </span>
            <span className="text-xs font-semibold text-gray-800 truncate block">
              {adminEmail || 'admin@antreyuk.com'}
            </span>
            <span className="inline-block mt-1 text-[10px] font-semibold text-[#16865B] bg-[#E8F5EE] px-2 py-0.5 rounded-md">
              Store Administrator
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-sm font-semibold transition-colors"
          >
            <LogOut size={16} />
            Keluar (Logout)
          </button>
        </div>
      </aside>
    </>
  );
};

