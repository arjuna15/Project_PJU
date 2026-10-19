'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Gauge,
  RefreshCw,
  Play,
  ArrowRight,
} from 'lucide-react';
import TrackingMap from './TrackingMap';
import { Order } from '@/lib/types';
import { formatDateWIB, formatPercent, updateDriverLocation } from '@/lib/api';

interface FleetTrackingViewProps {
  orders: Order[];
  onRefresh: () => void;
  onSelectOrderForDetail: (order: Order) => void;
}

export default function FleetTrackingView({
  orders,
  onRefresh,
  onSelectOrderForDetail,
}: FleetTrackingViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    orders.length > 0 ? orders[0].id : null
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  const handleSimulateGPSMove = async () => {
    if (!selectedOrder) return;

    setIsSimulating(true);
    setSimulationMessage('Mengirim sinyal koordinat GPS dari ponsel pengemudi…');

    try {
      const currentLat =
        selectedOrder.latest_tracking_log?.lat ?? selectedOrder.driver?.current_lat ?? -6.9175;
      const currentLng =
        selectedOrder.latest_tracking_log?.lng ?? selectedOrder.driver?.current_lng ?? 110.4283;

      const newLat = currentLat - 0.005;
      const newLng = currentLng + 0.08;
      const speed = Math.floor(65 + Math.random() * 15);

      await updateDriverLocation({
        order_id: selectedOrder.id,
        lat: Number(newLat.toFixed(5)),
        lng: Number(newLng.toFixed(5)),
        speed_kmh: speed,
        location_name: `Tol Trans-Jawa Km ${Math.floor(390 + Math.random() * 40)}`,
        status_milestone: 'Dalam Perjalanan Tol',
        note: `Pembaruan otomatis sinyal GPS smartphone driver (${selectedOrder.driver?.name ?? 'Driver'})`,
      });

      setSimulationMessage('Lokasi GPS diperbarui secara realtime di peta.');
      setTimeout(() => setSimulationMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setSimulationMessage(`Gagal mengirim GPS: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
              Live Fleet Tracking
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {orders.length} unit bergerak
            </span>
          </div>
          <p className="mt-1 text-[13px] text-stone-500">
            Pelacakan posisi unit vendor via GPS smartphone pengemudi — tanpa perangkat tambahan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="btn btn-outline">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>
          <button
            onClick={handleSimulateGPSMove}
            disabled={isSimulating || !selectedOrder}
            className="btn btn-primary"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isSimulating ? 'Mengirim…' : 'Simulasi gerak GPS'}</span>
          </button>
        </div>
      </div>

      {simulationMessage && (
        <div className="animate-fade-up flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-[12px] font-medium text-blue-800">
          <Navigation className="h-3.5 w-3.5 animate-spin text-blue-600" />
          <span>{simulationMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <div className="panel flex flex-col overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-700" />
              <span className="text-[13px] font-semibold text-ink">Sebaran armada terkini</span>
            </div>
            <span className="text-[11px] text-stone-400">Klik ikon truk untuk detail</span>
          </div>

          <div className="grow p-3">
            <TrackingMap
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={(ord) => setSelectedOrderId(ord.id)}
            />
          </div>

          {selectedOrder && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline bg-stone-50/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-[11px] font-bold text-white">
                  {selectedOrder.fleet?.vehicle_type.slice(0, 3).toUpperCase() || 'TRK'}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">
                      {selectedOrder.order_number}
                    </span>
                    <span className="font-mono text-[11px] text-stone-400">
                      {selectedOrder.fleet?.plate_number}
                    </span>
                    <span className="chip chip-info">
                      {selectedOrder.origin_city} → {selectedOrder.destination_city}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-500">
                    Driver <strong className="font-semibold text-stone-700">{selectedOrder.driver?.name}</strong>{' '}
                    · {selectedOrder.driver?.phone} · {selectedOrder.vendor?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 text-[11px]">
                <div>
                  <span className="block text-stone-400">Posisi terakhir</span>
                  <span className="font-medium text-stone-800">
                    {selectedOrder.latest_tracking_log?.location_name || 'Menunggu sinyal'}
                  </span>
                </div>
                <div>
                  <span className="block text-stone-400">Kecepatan</span>
                  <span className="font-medium text-stone-800">
                    {selectedOrder.latest_tracking_log?.speed_kmh || 0} km/jam
                  </span>
                </div>
                <button
                  onClick={() => onSelectOrderForDetail(selectedOrder)}
                  className="btn btn-outline"
                >
                  Rincian
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fleet list */}
        <div className="panel flex flex-col overflow-hidden">
          <div className="border-b border-hairline px-5 py-3.5">
            <h3 className="text-[13px] font-semibold text-ink">Unit aktif lapangan</h3>
            <p className="mt-0.5 text-[11px] text-stone-400">Pilih unit untuk memfokuskan peta</p>
          </div>

          <div className="max-h-[620px] space-y-2.5 overflow-y-auto p-3">
            {orders.length === 0 ? (
              <div className="py-10 text-center text-[12px] text-stone-400">
                Tidak ada armada aktif saat ini.
              </div>
            ) : (
              orders.map((order) => {
                const isSelected = order.id === selectedOrderId;
                const isUnderMargin = order.is_under_margin;

                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50/50 ring-1 ring-blue-600/20'
                        : 'border-hairline hover:border-stone-300 hover:bg-stone-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-ink">
                            {order.order_number}
                          </span>
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-500">
                            {order.fleet?.plate_number}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-medium text-stone-700">
                          {order.origin_city} → {order.destination_city}
                        </p>
                      </div>
                      <span className={`chip ${isUnderMargin ? 'chip-neg' : 'chip-pos'}`}>
                        {formatPercent(order.margin_percentage)}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-hairline pt-2 text-[11px]">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-stone-400">Vendor</span>
                        <span className="truncate font-medium text-stone-600">
                          {order.vendor?.name}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] text-stone-400">Driver</span>
                        <span className="truncate font-medium text-stone-600">
                          {order.driver?.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {order.latest_tracking_log?.speed_kmh ?? 0} km/j
                      </span>
                      <span>{formatDateWIB(order.latest_tracking_log?.created_at)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
