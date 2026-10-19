'use client';

import React from 'react';
import {
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  Wallet,
  Smartphone,
  Search,
  Truck,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export type UserRole = 'admin' | 'finance' | 'driver' | 'customer';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeOrdersCount: number;
  underMarginCount: number;
}

const ROLE_LABELS: Record<UserRole, { label: string; short: string; icon: React.ElementType }> = {
  admin: { label: 'Manajemen PJU', short: 'Manajemen', icon: ShieldCheck },
  finance: { label: 'Staf Keuangan', short: 'Keuangan', icon: Wallet },
  driver: { label: 'Driver Lapangan', short: 'Driver', icon: Smartphone },
  customer: { label: 'Portal Pelanggan', short: 'Pelanggan', icon: UserCheck },
};

export default function Navbar({
  currentTab,
  onTabChange,
  userRole,
  onRoleChange,
  activeOrdersCount,
  underMarginCount,
}: NavbarProps) {
  const navItems: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    alert?: string;
  }[] = [
    { id: 'dashboard', label: 'Profit & Margin', icon: TrendingUp },
    {
      id: 'tracking',
      label: 'Live Tracking',
      icon: MapPin,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'orders',
      label: 'Manajemen Order',
      icon: FileSpreadsheet,
      alert: underMarginCount > 0 ? `${underMarginCount}` : undefined,
    },
    { id: 'finance', label: 'Piutang & Utang', icon: Wallet },
    { id: 'driver-mobile', label: 'Aplikasi Driver', icon: Smartphone },
    { id: 'customer-portal', label: 'Lacak Kiriman', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-white/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Top row: brand + controls */}
        <div className="flex h-[60px] items-center justify-between gap-4">
          <button
            onClick={() => onTabChange('dashboard')}
            className="group flex items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-ink text-white transition-transform group-hover:-rotate-3">
              <Truck className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="leading-tight">
              <span className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  Parkit Jaya Utama
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 sm:inline">
                  PJU
                </span>
              </span>
              <span className="hidden text-[11px] text-stone-400 sm:block">
                Logistics &amp; Fleet Monitoring
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Live status */}
            <span className="hidden items-center gap-2 rounded-full border border-hairline bg-white px-2.5 py-1 text-[11px] font-medium text-stone-500 md:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Sistem aktif
            </span>

            {/* Segmented role switcher (desktop) */}
            <div className="hidden items-center rounded-lg border border-hairline bg-stone-50 p-0.5 lg:flex">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => {
                const info = ROLE_LABELS[role];
                const Icon = info.icon;
                const isActive = userRole === role;
                return (
                  <button
                    key={role}
                    onClick={() => onRoleChange(role)}
                    title={info.label}
                    className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-all ${
                      isActive
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${isActive ? 'text-blue-700' : 'text-stone-400'}`}
                    />
                    <span>{info.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact role select (mobile) */}
            <select
              value={userRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="field w-auto py-1.5 text-[12px] lg:hidden"
              aria-label="Mode hak akses"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom row: navigation */}
        <nav className="scrollbar-none -mb-px flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group relative flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'border-blue-700 text-ink'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-blue-700' : 'text-stone-400 group-hover:text-stone-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 tabular-nums">
                    {item.badge}
                  </span>
                )}
                {item.alert !== undefined && (
                  <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 tabular-nums">
                    {item.alert}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
