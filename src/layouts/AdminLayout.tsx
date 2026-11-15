import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { SupabaseStatusBanner } from '../components/common/SupabaseStatusBanner';
import { getCurrentAdmin } from '../services/authService';
import { getStoreDetails, subscribeToStoreChanges } from '../services/storeService';
import { AdminUser, Store } from '../types/queue';
import { DEFAULT_STORE_ID } from '../services/mockStorage';

export const AdminLayout: React.FC = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const user = await getCurrentAdmin();
      if (!user) {
        navigate('/admin/login', { replace: true, state: { from: location } });
        return;
      }
      setAdminUser(user);
      const storeData = await getStoreDetails(DEFAULT_STORE_ID);
      setStore(storeData);
    } catch (err) {
      console.error('Error loading admin layout data:', err);
    } finally {
      setIsLoadingAuth(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubStore = subscribeToStoreChanges(DEFAULT_STORE_ID, (updatedStore) => {
      setStore(updatedStore);
    });

    return () => {
      unsubStore();
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16865B] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-600">Memuat Sesi Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans">
      <SupabaseStatusBanner />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          adminEmail={adminUser?.email}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
          <AdminHeader
            onToggleSidebar={() => setSidebarOpen(true)}
            store={store}
            onRefresh={loadData}
            isRefreshing={isRefreshing}
          />

          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            <Outlet context={{ store, adminUser, refreshData: loadData }} />
          </main>
        </div>
      </div>
    </div>
  );
};

