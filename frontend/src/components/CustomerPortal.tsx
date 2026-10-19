'use client';

import React, { useState } from 'react';
import { Search, Package, CheckCircle2, MapPin, FileText, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatDateWIB, publicTrackOrder } from '@/lib/api';

export default function CustomerPortal() {
  const [trackingCode, setTrackingCode] = useState('PJU-001');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await publicTrackOrder(trackingCode.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Data pengiriman tidak ditemukan.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'po_confirmed', label: 'Order dikonfirmasi' },
    { key: 'dispatched', label: 'Armada ditugaskan' },
    { key: 'in_transit', label: 'Dalam perjalanan' },
    { key: 'arrived', label: 'Tiba di tujuan' },
    { key: 'delivered', label: 'POD diterima' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'inquiry':
      case 'quotation':
        return 0;
      case 'po_confirmed':
        return 1;
      case 'dispatched':
      case 'loading':
        return 2;
      case 'in_transit':
        return 3;
      case 'arrived':
        return 4;
      case 'delivered':
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      {/* Search panel */}
      <div className="panel p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
            <Package className="h-4 w-4" />
          </span>
          <span className="eyebrow">Portal pelanggan</span>
        </div>
        <h1 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
          Lacak posisi kiriman Anda
        </h1>
        <p className="mt-1 text-[13px] text-stone-500">
          Pantau armada pengangkut muatan secara langsung dengan nomor order PJU atau nomor PO.
        </p>

        <form onSubmit={handleTrack} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Contoh: PJU-001 atau PO-CPA-2026-0941"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="field py-2.5 pl-9"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary px-5 py-2.5">
            {loading ? 'Mencari…' : 'Lacak'}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
          <span>Contoh cepat:</span>
          {['PJU-001', 'PJU-002', 'PJU-003'].map((code) => (
            <button
              key={code}
              onClick={() => {
                setTrackingCode(code);
                handleTrack();
              }}
              className="rounded-md border border-hairline px-2 py-0.5 font-medium text-stone-600 transition hover:bg-stone-50"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[12px] text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="panel space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline pb-5">
            <div>
              <span className="eyebrow">Detail pengiriman</span>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-ink">
                {order.order_number}
              </h2>
              <p className="mt-0.5 text-[12px] text-stone-500">
                Pelanggan{' '}
                <strong className="font-medium text-stone-700">
                  {order.customer_name ?? order.customer?.name}
                </strong>{' '}
                · PO{' '}
                <strong className="font-medium text-stone-700">
                  {order.customer_po_number || '-'}
                </strong>
              </p>
            </div>

            <div className="text-right">
              <span className="chip chip-pos capitalize">
                {order.status === 'in_transit' ? 'Dalam perjalanan' : order.status.replace('_', ' ')}
              </span>
              <p className="mt-1.5 text-[11px] text-stone-400">
                Armada {order.plate_number || order.fleet?.plate_number || '-'}
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div>
            <span className="eyebrow mb-3 block">Progres pengiriman</span>
            <div className="flex items-start overflow-x-auto pb-1">
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx > idx + 1;
                const isCurrent = currentStepIdx === idx + 1;
                const isDone = isPassed || isCurrent;
                return (
                  <div key={step.key} className="flex min-w-[92px] flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      <span
                        className={`h-0.5 flex-1 ${
                          idx === 0 ? 'bg-transparent' : isDone ? 'bg-emerald-400' : 'bg-stone-200'
                        }`}
                      />
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                          isCurrent
                            ? 'border-blue-700 bg-blue-700 text-white'
                            : isPassed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-stone-200 bg-white text-stone-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                      </span>
                      <span
                        className={`h-0.5 flex-1 ${
                          idx === steps.length - 1
                            ? 'bg-transparent'
                            : isDone && currentStepIdx > idx + 1
                            ? 'bg-emerald-400'
                            : 'bg-stone-200'
                        }`}
                      />
                    </div>
                    <span
                      className={`mt-2 text-center text-[11px] leading-tight ${
                        isCurrent ? 'font-semibold text-blue-800' : isDone ? 'text-stone-600' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route & cargo */}
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-hairline bg-stone-50/60 p-4 sm:grid-cols-2">
            <div>
              <span className="text-[11px] font-medium text-stone-400">Lokasi asal (pickup)</span>
              <strong className="mt-0.5 block text-[14px] font-semibold text-stone-800">
                {order.origin_city}
              </strong>
              <p className="mt-0.5 text-[12px] text-stone-500">
                {order.origin_address || 'Pool / pabrik pengirim'}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-stone-400">Lokasi tujuan (delivery)</span>
              <strong className="mt-0.5 block text-[14px] font-semibold text-stone-800">
                {order.destination_city}
              </strong>
              <p className="mt-0.5 text-[12px] text-stone-500">
                {order.destination_address || 'Gudang distribusi penerima'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <MapPin className="h-4 w-4 text-blue-700" />
              Riwayat titik GPS &amp; posisi terkini
            </h3>

            <div className="relative space-y-3 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-hairline">
              {order.tracking_logs && order.tracking_logs.length > 0 ? (
                order.tracking_logs.map((log, idx) => (
                  <div key={idx} className="relative pl-7">
                    <span className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-700 ring-1 ring-blue-200" />
                    <div className="rounded-lg border border-hairline bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-[12px] font-medium text-stone-800">
                          {log.location_name || 'Checkpoint'}
                        </strong>
                        <span className="text-[10px] text-stone-400">
                          {formatDateWIB(log.created_at)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {log.note || log.status_milestone}
                      </p>
                      {log.speed_kmh > 0 && (
                        <span className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] text-blue-700">
                          {log.speed_kmh} km/jam
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="pl-7 text-[12px] text-stone-400">
                  Belum ada sinyal GPS yang tercatat untuk order ini.
                </p>
              )}
            </div>
          </div>

          {/* Documents */}
          {order.documents && order.documents.length > 0 && (
            <div className="border-t border-hairline pt-5">
              <span className="eyebrow mb-3 block">Dokumen digital</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {order.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-hairline bg-stone-50/60 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-stone-500" />
                      <div className="min-w-0">
                        <span className="block max-w-[180px] truncate text-[12px] font-medium text-stone-800">
                          {doc.file_name}
                        </span>
                        <span className="text-[10px] capitalize text-stone-400">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button className="text-[11px] font-semibold text-blue-700 hover:underline">
                      Lihat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
