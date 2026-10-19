'use client';

import React, { useEffect, useState } from 'react';
import Navbar, { UserRole } from '@/components/Navbar';
import ProfitDashboard from '@/components/ProfitDashboard';
import FleetTrackingView from '@/components/FleetTrackingView';
import OrderManagement from '@/components/OrderManagement';
import FinanceView from '@/components/FinanceView';
import DriverPortal from '@/components/DriverPortal';
import CustomerPortal from '@/components/CustomerPortal';
import OrderDetailDrawer from '@/components/OrderDetailDrawer';
import { DashboardSummary, FinanceData, MasterData, Order } from '@/lib/types';
import {
  fetchDashboardSummary,
  fetchFinanceData,
  fetchMasterData,
  fetchOrders,
} from '@/lib/api';
import { AlertCircle, Truck } from 'lucide-react';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Application Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [masterData, setMasterData] = useState<MasterData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterUnderMarginInOrders, setFilterUnderMarginInOrders] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const [sumRes, ordersRes, finRes, mastRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchOrders(),
        fetchFinanceData(),
        fetchMasterData(),
      ]);

      setSummary(sumRes);
      setOrders(ordersRes);
      setFinanceData(finRes);
      setMasterData(mastRes);
    } catch (err: any) {
      console.error('API Load Error:', err);
      setError(
        'Gagal terhubung ke API backend Laravel 11. Pastikan server Laravel aktif di port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds for live operations
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'driver') {
      setCurrentTab('driver-mobile');
    } else if (role === 'customer') {
      setCurrentTab('customer-portal');
    } else if (role === 'finance') {
      setCurrentTab('finance');
    } else if (role === 'admin') {
      setCurrentTab('dashboard');
    }
  };

  const handleNavigateToOrders = (underMargin = false) => {
    setFilterUnderMarginInOrders(underMargin);
    setCurrentTab('orders');
  };

  const activeOrdersForMap = orders.filter(
    (o) => o.status === 'in_transit' || o.status === 'dispatched' || o.status === 'loading' || o.status === 'arrived'
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'orders') setFilterUnderMarginInOrders(false);
          setCurrentTab(tab);
        }}
        userRole={userRole}
        onRoleChange={handleRoleChange}
        activeOrdersCount={activeOrdersForMap.length}
        underMarginCount={orders.filter((o) => o.is_under_margin).length}
      />

      <main className="mx-auto w-full max-w-[1400px] grow px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-rose-700"
            >
              Coba Ulang
            </button>
          </div>
        )}

        {currentTab === 'dashboard' && (
          <ProfitDashboard
            summary={summary}
            orders={orders}
            onNavigateToOrders={handleNavigateToOrders}
            onRefresh={loadData}
          />
        )}

        {currentTab === 'tracking' && (
          <FleetTrackingView
            orders={activeOrdersForMap.length > 0 ? activeOrdersForMap : orders}
            onRefresh={loadData}
            onSelectOrderForDetail={(ord) => setSelectedOrder(ord)}
          />
        )}

        {currentTab === 'orders' && (
          <OrderManagement
            orders={orders}
            masterData={masterData}
            onRefresh={loadData}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            initialFilterUnderMargin={filterUnderMarginInOrders}
          />
        )}

        {currentTab === 'finance' && (
          <FinanceView financeData={financeData} onRefresh={loadData} />
        )}

        {currentTab === 'driver-mobile' && (
          <DriverPortal orders={orders} onRefresh={loadData} />
        )}

        {currentTab === 'customer-portal' && <CustomerPortal />}
      </main>

      {/* Slide-over Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-hairline bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-between gap-2 px-4 py-5 text-[11px] text-stone-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-stone-300" />
            <span>
              <strong className="font-semibold text-stone-700">PT Parkit Jaya Utama</strong>
              <span className="mx-1.5 text-stone-300">·</span>
              Jl. Oscar 1 Blok C7 No. 20, Harapan Baru 2, Bekasi Barat
            </span>
          </div>
          <div>
            Aplikasi Tracking Unit &amp; Monitoring Profit
            <span className="mx-1.5 text-stone-300">·</span>
            Dikembangkan oleh <strong className="font-semibold text-stone-700">PT Escava Jelajah Indonesia</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
