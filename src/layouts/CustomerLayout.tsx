import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { SupabaseStatusBanner } from '../components/common/SupabaseStatusBanner';
import { Store } from '../types/queue';
import { getStoreDetails, subscribeToStoreChanges } from '../services/storeService';
import { DEFAULT_STORE_ID } from '../services/mockStorage';

export const CustomerLayout: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    let isMounted = true;
    getStoreDetails(DEFAULT_STORE_ID).then((data) => {
      if (isMounted) setStore(data);
    });

    const unsubscribe = subscribeToStoreChanges(DEFAULT_STORE_ID, (updatedStore) => {
      if (isMounted) setStore(updatedStore);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#1F2937] font-sans antialiased selection:bg-[#16865B] selection:text-white">
      <SupabaseStatusBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ store }} />
      </main>
      <Footer store={store} />
    </div>
  );
};

