'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Truck,
  Building2,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { DashboardSummary, Order } from '@/lib/types';
import { formatPercent, formatRupiah } from '@/lib/api';

interface ProfitDashboardProps {
  summary: DashboardSummary | null;
  orders: Order[];
  onNavigateToOrders: (filterUnderMargin?: boolean) => void;
  onRefresh: () => void;
}

const PERIODS = [
  { id: 'all', label: 'Semua' },
  { id: 'this_month', label: 'Bulan ini' },
  { id: 'today', label: 'Hari ini' },
] as const;

export default function ProfitDashboard({
  summary,
  orders,
  onNavigateToOrders,
}: ProfitDashboardProps) {
  const [period, setPeriod] = useState<'all' | 'this_month' | 'today'>('all');

  if (!summary) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-3 py-24 text-stone-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-blue-700" />
        <p className="text-[13px]">Menghitung profit &amp; margin…</p>
      </div>
    );
  }

  const { overview, route_ranking, vendor_ranking, customer_ranking, monthly_trends } = summary;
  const alertOrders = orders.filter((o) => o.is_under_margin);

  const maxRev = Math.max(...monthly_trends.map((m) => m.revenue), 1);

  const kpis = [
    {
      label: 'Total Omzet',
      value: formatRupiah(overview.total_revenue),
      hint: `${orders.length} order tercatat`,
      accent: 'text-ink',
    },
    {
      label: 'Biaya Vendor & Tambahan',
      value: formatRupiah(overview.total_vendor_cost + overview.total_additional_cost),
      hint: `Vendor ${formatRupiah(overview.total_vendor_cost)}`,
      accent: 'text-ink',
    },
    {
      label: 'Laba Kotor',
      value: formatRupiah(overview.total_gross_profit),
      hint: 'Setelah potongan vendor',
      accent: 'text-emerald-700',
    },
    {
      label: 'Rata-rata Margin',
      value: formatPercent(overview.avg_margin_percentage),
      hint: 'Target minimum 10,0%',
      accent: overview.avg_margin_percentage >= 10 ? 'text-ink' : 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Ringkasan Profit &amp; Margin
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Margin kotor per order, rute, vendor armada rekanan, dan pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-hairline bg-stone-50 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all ${
                  period === p.id
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <a
            href="http://127.0.0.1:8000/api/orders/export-csv"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </a>
        </div>
      </div>

      {/* Margin alert */}
      {alertOrders.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="min-w-0 grow">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="text-[13px] font-semibold text-amber-900">
                  {alertOrders.length} order di bawah batas margin minimum
                </h3>
                <span className="text-[11px] text-amber-700/80">target ≥ 10,0%</span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-amber-800/90">
                Selisih harga jual dan biaya vendor terlalu tipis. Tinjau ulang tarif vendor
                atau ajukan revisi penawaran ke pelanggan.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {alertOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => onNavigateToOrders(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-300/70 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 transition hover:bg-amber-100/60"
                  >
                    <span className="font-semibold">{o.order_number}</span>
                    <span className="text-amber-800/60">
                      {o.origin_city} → {o.destination_city}
                    </span>
                    <span className="font-semibold text-rose-600 tnum">
                      {formatPercent(o.margin_percentage)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigateToOrders(true)}
              className="hidden shrink-0 text-[12px] font-semibold text-amber-800 hover:underline sm:block"
            >
              Tinjau
            </button>
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="panel p-5">
            <span className="eyebrow">{kpi.label}</span>
            <p className={`mt-2.5 text-[24px] font-semibold tracking-[-0.02em] tnum ${kpi.accent}`}>
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* Cashflow + operational */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-ink p-5 text-white lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-400">
              Arus kas operasional
            </span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-stone-200">
              Net working capital
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-[11px] text-stone-400">Piutang pelanggan</p>
              <p className="mt-1 text-[17px] font-semibold text-amber-300 tnum">
                {formatRupiah(overview.total_receivables)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-stone-400">Utang ke vendor</p>
              <p className="mt-1 text-[17px] font-semibold text-rose-300 tnum">
                {formatRupiah(overview.total_payables)}
              </p>
            </div>
          </div>
        </div>

        <div className="panel flex items-center justify-between p-5">
          <div>
            <span className="eyebrow">Armada bergerak</span>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] tnum">
              {overview.active_orders_count}
              <span className="ml-1 text-[13px] font-medium text-stone-400">unit</span>
            </p>
            <p className="mt-0.5 text-[11px] text-blue-700">Terhubung GPS driver</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
            <Truck className="h-5 w-5" />
          </span>
        </div>

        <div className="panel flex items-center justify-between p-5">
          <div>
            <span className="eyebrow">Pengiriman selesai</span>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.02em] tnum">
              {overview.completed_orders_count}
              <span className="ml-1 text-[13px] font-medium text-stone-400">order</span>
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-700">Surat jalan &amp; POD lengkap</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Trend + routes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly trend */}
        <div className="panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="panel-title">Tren 6 bulan terakhir</h3>
              <p className="panel-desc mt-0.5">Omzet dipecah menjadi laba kotor dan biaya</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Laba
              </span>
              <span className="flex items-center gap-1.5 text-stone-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600/30" /> Biaya
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {monthly_trends.map((m, idx) => {
              const totalPct = Math.round((m.revenue / maxRev) * 100);
              const profitShare =
                m.revenue > 0 ? Math.max(0, Math.min(100, (m.profit / m.revenue) * 100)) : 0;
              return (
                <div key={idx}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <span className="w-20 text-[12px] font-medium text-stone-700">{m.month}</span>
                    <div className="flex items-center gap-3 text-[11px] tnum">
                      <span className="hidden text-stone-500 sm:inline">
                        {formatRupiah(m.revenue)}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {formatRupiah(m.profit)}
                      </span>
                      <span className="chip chip-neutral">{formatPercent(m.margin)}</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-stone-100">
                    <div
                      className="flex h-full overflow-hidden rounded-full"
                      style={{ width: `${totalPct}%` }}
                      title={`Omzet ${formatRupiah(m.revenue)} · Laba ${formatRupiah(m.profit)}`}
                    >
                      <div className="h-full bg-emerald-500" style={{ width: `${profitShare}%` }} />
                      <div className="h-full flex-1 bg-blue-600/25" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top routes */}
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="panel-title">Rute paling menguntungkan</h3>
              <p className="panel-desc mt-0.5">Peringkat laba kotor</p>
            </div>
            <MapPin className="h-4 w-4 text-stone-300" />
          </div>

          <div className="mt-4 space-y-2.5">
            {route_ranking.map((route, i) => (
              <div
                key={i}
                className="rounded-lg border border-hairline bg-stone-50/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-[11px] font-semibold text-stone-300 tnum">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate text-[12px] font-semibold text-stone-900">
                      {route.route_name}
                    </span>
                  </div>
                  <span
                    className={`chip ${
                      route.avg_margin >= 10 ? 'chip-pos' : 'chip-neg'
                    }`}
                  >
                    {formatPercent(route.avg_margin)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
                  <span>{route.total_trips} pengiriman</span>
                  <span className="font-semibold text-emerald-700 tnum">
                    {formatRupiah(route.total_profit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor & customer performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <div>
              <h3 className="panel-title">Kinerja vendor armada</h3>
              <p className="panel-desc mt-0.5">Berdasarkan volume &amp; kontribusi laba</p>
            </div>
            <Truck className="h-4 w-4 text-stone-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th className="text-center">Order</th>
                  <th className="text-right">Kontribusi laba</th>
                  <th className="text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {vendor_ranking.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium text-stone-800">{v.name}</td>
                    <td className="text-center text-stone-500 tnum">{v.total_trips}</td>
                    <td className="text-right font-semibold text-emerald-700 tnum">
                      {formatRupiah(v.total_profit)}
                    </td>
                    <td className="text-right">
                      <span className={`chip ${v.avg_margin >= 10 ? 'chip-pos' : 'chip-neg'}`}>
                        {formatPercent(v.avg_margin)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <div>
              <h3 className="panel-title">Portofolio pelanggan</h3>
              <p className="panel-desc mt-0.5">Peringkat berdasarkan nilai pengiriman</p>
            </div>
            <Building2 className="h-4 w-4 text-stone-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Perusahaan</th>
                  <th className="text-center">PO</th>
                  <th className="text-right">Nilai tagihan</th>
                  <th className="text-right">Laba kotor</th>
                </tr>
              </thead>
              <tbody>
                {customer_ranking.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-stone-800">{c.name}</td>
                    <td className="text-center text-stone-500 tnum">{c.total_orders}</td>
                    <td className="text-right text-stone-700 tnum">
                      {formatRupiah(c.total_revenue)}
                    </td>
                    <td className="text-right font-semibold text-emerald-700 tnum">
                      {formatRupiah(c.total_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
