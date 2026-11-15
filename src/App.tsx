
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { TakeQueuePage } from './pages/customer/TakeQueuePage';
import { TicketPage } from './pages/customer/TicketPage';
import { QueueMonitorPage } from './pages/customer/QueueMonitorPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminManageQueuesPage } from './pages/admin/AdminManageQueuesPage';
import { AdminQueueHistoryPage } from './pages/admin/AdminQueueHistoryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/AntreYuk">
      <Routes>
        {/* Customer Public Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ambil-antrean" element={<TakeQueuePage />} />
          <Route path="/tiket/:token" element={<TicketPage />} />
          <Route path="/antrean" element={<QueueMonitorPage />} />
          <Route path="/antrean/:token" element={<QueueMonitorPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="antrean" element={<AdminManageQueuesPage />} />
          <Route path="riwayat" element={<AdminQueueHistoryPage />} />
          <Route path="pengaturan" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
