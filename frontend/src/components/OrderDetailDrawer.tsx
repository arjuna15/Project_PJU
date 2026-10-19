'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatDateWIB, formatPercent, formatRupiah } from '@/lib/api';

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  if (!order) return null;

  const isUnder = order.is_under_margin;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-[var(--shadow-float)]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-white/90 px-6 py-5 backdrop-blur">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
                {order.order_number}
              </span>
              <span className={`chip ${isUnder ? 'chip-neg' : 'chip-pos'}`}>
                Margin {formatPercent(order.margin_percentage)}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-stone-500">
              Pelanggan{' '}
              <strong className="font-medium text-stone-700">{order.customer?.name}</strong> · PO{' '}
              {order.customer_po_number || '-'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Margin warning */}
          {isUnder && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 p-3.5 text-[12px] text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <strong className="block font-semibold">
                  Margin tipis ({formatPercent(order.margin_percentage)})
                </strong>
                Nilai margin berada di bawah target minimum 10,0%. Perhatikan pengeluaran tambahan
                uang jalan atau pertimbangkan penyesuaian tarif.
              </div>
            </div>
          )}

          {/* Financial breakdown */}
          <div className="rounded-lg border border-hairline bg-stone-50/60 p-4">
            <span className="eyebrow mb-3 block">Rincian finansial &amp; profitabilitas</span>
            <div className="space-y-2 text-[12px]">
              <Row label="Harga jual ke pelanggan" value={formatRupiah(order.customer_price)} strong />
              <Row label="Biaya vendor pokok" value={`-${formatRupiah(order.vendor_cost)}`} negative />
              <Row label="Uang jalan & tol" value={`-${formatRupiah(order.uang_jalan)}`} negative />
              <Row
                label="Bongkar muat & waiting time"
                value={`-${formatRupiah(
                  order.bongkar_muat + order.waiting_time + order.other_cost
                )}`}
                negative
              />
              <div className="flex items-center justify-between border-t border-hairline pt-3">
                <span className="text-[13px] font-semibold text-ink">Laba kotor PJU</span>
                <span className="text-[14px] font-semibold text-emerald-700 tnum">
                  {formatRupiah(order.gross_profit)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-500">Persentase margin</span>
                <span className={`font-semibold tnum ${isUnder ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatPercent(order.margin_percentage)}
                </span>
              </div>
            </div>
          </div>

          {/* Operational details */}
          <div>
            <span className="eyebrow mb-3 block">Detail operasional</span>
            <div className="space-y-3 rounded-lg border border-hairline p-4 text-[12px]">
              <div>
                <span className="block text-[11px] text-stone-400">Rute pengiriman</span>
                <strong className="font-medium text-stone-800">
                  {order.origin_city} → {order.destination_city}
                </strong>
                <p className="mt-0.5 text-[11px] text-stone-500">{order.origin_address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-hairline pt-3">
                <Field
                  label="Armada & nopol"
                  value={`${order.fleet?.plate_number || '-'} (${order.vehicle_type_required})`}
                />
                <Field
                  label="Muatan barang"
                  value={`${order.cargo_description} (${order.cargo_weight_ton} ton)`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-hairline pt-3">
                <Field label="Vendor armada" value={order.vendor?.name || 'Belum ditugaskan'} />
                <Field label="Pengemudi" value={order.driver?.name || '-'} />
              </div>
            </div>
          </div>

          {/* AR / AP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-hairline bg-stone-50/60 p-3.5">
              <span className="eyebrow block">Piutang pelanggan</span>
              <span className={`chip mt-2 ${order.customer_payment_status === 'paid' ? 'chip-pos' : 'chip-warn'}`}>
                {order.customer_payment_status === 'paid' ? 'Lunas' : 'Belum lunas'}
              </span>
              <span className="mt-2 block font-mono text-[11px] text-stone-500">
                {order.customer_invoice_no || 'Belum ada invoice'}
              </span>
            </div>

            <div className="rounded-lg border border-hairline bg-stone-50/60 p-3.5">
              <span className="eyebrow block">Utang ke vendor</span>
              <span className={`chip mt-2 ${order.vendor_payment_status === 'paid' ? 'chip-pos' : 'chip-neg'}`}>
                {order.vendor_payment_status === 'paid' ? 'Sudah dibayar' : 'Belum dibayar'}
              </span>
              <span className="mt-2 block font-mono text-[11px] text-stone-500">
                {order.vendor_invoice_no || 'Belum ada bill'}
              </span>
            </div>
          </div>

          {/* GPS logs */}
          <div>
            <span className="eyebrow mb-3 block">Riwayat checkpoint GPS</span>
            <div className="space-y-2">
              {order.tracking_logs && order.tracking_logs.length > 0 ? (
                order.tracking_logs.map((log, idx) => (
                  <div key={idx} className="rounded-lg border border-hairline bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[12px] font-medium text-stone-800">
                        {log.location_name}
                      </strong>
                      <span className="text-[10px] text-stone-400">
                        {formatDateWIB(log.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-stone-500">{log.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-stone-400">Belum ada titik pelacakan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  negative,
  strong,
}: {
  label: string;
  value: string;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-stone-500">{label}</span>
      <span
        className={`tnum ${negative ? 'text-rose-600' : strong ? 'font-semibold text-ink' : 'text-stone-700'}`}
      >
        {value}
      </span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] text-stone-400">{label}</span>
      <span className="block truncate font-medium text-stone-800">{value}</span>
    </div>
  );
}
