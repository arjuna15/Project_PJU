'use client';

import React, { useState } from 'react';
import { Smartphone, Navigation, Camera, Upload } from 'lucide-react';
import { Order } from '@/lib/types';
import { updateDriverLocation, updateOrderStatus, uploadDocument } from '@/lib/api';

interface DriverPortalProps {
  orders: Order[];
  onRefresh: () => void;
}

export default function DriverPortal({ orders, onRefresh }: DriverPortalProps) {
  const activeOrders = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'inquiry' && o.fleet_id
  );
  const [selectedOrderId, setSelectedOrderId] = useState<number>(
    activeOrders.length > 0 ? activeOrders[0].id : orders[0]?.id ?? 1
  );

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [isUpdatingGPS, setIsUpdatingGPS] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  const [documentType, setDocumentType] = useState<'surat_jalan' | 'bukti_terima_pod'>(
    'bukti_terima_pod'
  );
  const [docNotes, setDocNotes] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleSendCurrentGPS = () => {
    if (!selectedOrder) return;
    setIsUpdatingGPS(true);
    setGpsStatusMessage('Mengakses sensor GPS smartphone…');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateDriverLocation({
              order_id: selectedOrder.id,
              lat: Number(position.coords.latitude.toFixed(6)),
              lng: Number(position.coords.longitude.toFixed(6)),
              speed_kmh: position.coords.speed ? Math.round(position.coords.speed * 3.6) : 60,
              location_name: 'Lokasi riil sensor GPS smartphone driver',
              status_milestone: 'Dalam Perjalanan',
              note: 'Dikirim langsung dari ponsel pengemudi di lapangan',
            });
            setGpsStatusMessage('Lokasi GPS berhasil dibagikan ke server.');
            onRefresh();
          } catch (err: any) {
            setGpsStatusMessage(`Gagal kirim GPS: ${err.message}`);
          } finally {
            setIsUpdatingGPS(false);
            setTimeout(() => setGpsStatusMessage(null), 4000);
          }
        },
        async () => {
          const fallbackLat = (selectedOrder.latest_tracking_log?.lat ?? -6.9175) + 0.01;
          const fallbackLng = (selectedOrder.latest_tracking_log?.lng ?? 110.4283) + 0.02;
          await updateDriverLocation({
            order_id: selectedOrder.id,
            lat: Number(fallbackLat.toFixed(6)),
            lng: Number(fallbackLng.toFixed(6)),
            speed_kmh: 68,
            location_name: `Jalan Tol Km ${Math.floor(200 + Math.random() * 200)}`,
            status_milestone: 'Dalam Perjalanan Tol',
            note: 'GPS smartphone driver (mode lapangan)',
          });
          setGpsStatusMessage('Koordinat perjalanan berhasil diperbarui.');
          setIsUpdatingGPS(false);
          setTimeout(() => setGpsStatusMessage(null), 4000);
          onRefresh();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleUpdateMilestone = async (newStatus: string, milestoneName: string) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, `Driver mengubah status ke: ${milestoneName}`);
      await updateDriverLocation({
        order_id: selectedOrder.id,
        lat: selectedOrder.latest_tracking_log?.lat ?? -6.9175,
        lng: selectedOrder.latest_tracking_log?.lng ?? 110.4283,
        speed_kmh: newStatus === 'in_transit' ? 65 : 0,
        location_name: milestoneName,
        status_milestone: milestoneName,
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  const handleMockUploadPOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUploadingDoc(true);
    setUploadMessage('Mengunggah berkas dari kamera pengemudi…');

    try {
      await uploadDocument({
        order_id: selectedOrder.id,
        document_type: documentType,
        file_name: `${documentType.toUpperCase()}_${selectedOrder.order_number}_${Date.now()}.jpg`,
        notes:
          docNotes ||
          (documentType === 'bukti_terima_pod'
            ? 'Stempel basah penerima gudang'
            : 'Surat jalan asli dari pengirim'),
        uploaded_by_role: 'driver',
      });

      setUploadMessage('Dokumen berhasil diunggah. Status order diperbarui.');
      setDocNotes('');
      setTimeout(() => setUploadMessage(null), 4000);
      onRefresh();
    } catch (err: any) {
      setUploadMessage(`Gagal unggah: ${err.message}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 animate-fade-up">
      {/* App header */}
      <div className="flex items-center justify-between rounded-xl bg-ink p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Smartphone className="h-5 w-5 text-amber-300" />
          </span>
          <div>
            <h2 className="text-[14px] font-semibold">Aplikasi Driver</h2>
            <p className="text-[11px] text-stone-400">GPS &amp; bukti terima tanpa alat tambahan</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          GPS aktif
        </span>
      </div>

      {/* Trip selector */}
      <div className="panel p-4">
        <label className="label mb-1.5">Pilih tugas pengiriman</label>
        <select
          value={selectedOrderId}
          onChange={(e) => setSelectedOrderId(Number(e.target.value))}
          className="field"
        >
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.order_number} · {o.origin_city} → {o.destination_city} ({o.cargo_description})
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div className="space-y-4">
          {/* Trip card */}
          <div className="panel space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="eyebrow">Tugas pengiriman</span>
                <h3 className="mt-1 text-[16px] font-semibold text-ink">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-[11px] text-stone-400">
                  PO: {selectedOrder.customer_po_number || '-'}
                </p>
              </div>
              <span className="chip chip-info capitalize">
                {selectedOrder.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 rounded-lg border border-hairline bg-stone-50/60 p-3.5 text-[12px]">
              {[
                ['Pengemudi', selectedOrder.driver?.name ?? 'Budi Santoso'],
                ['Nomor polisi', selectedOrder.fleet?.plate_number ?? 'B 9481 UYT'],
                [
                  'Rute',
                  `${selectedOrder.origin_city} → ${selectedOrder.destination_city}`,
                ],
                [
                  'Muatan',
                  `${selectedOrder.cargo_description} (${selectedOrder.cargo_weight_ton} ton)`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-stone-400">{label}</span>
                  <strong className="text-right font-medium text-stone-800">{value}</strong>
                </div>
              ))}
            </div>

            <button
              onClick={handleSendCurrentGPS}
              disabled={isUpdatingGPS}
              className="btn btn-success w-full py-3"
            >
              <Navigation className={`h-4 w-4 ${isUpdatingGPS ? 'animate-spin' : ''}`} />
              {isUpdatingGPS ? 'Mengirim sinyal GPS…' : 'Bagikan lokasi GPS terkini'}
            </button>

            {gpsStatusMessage && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-[11px] font-medium text-emerald-700">
                {gpsStatusMessage}
              </p>
            )}
          </div>

          {/* Milestones */}
          <div className="panel space-y-3 p-5">
            <span className="eyebrow block">Pembaruan tahap pengiriman</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '1. Sedang muat', status: 'loading', milestone: 'Sedang Muat di Gudang', primary: false },
                { label: '2. Berangkat / jalan', status: 'in_transit', milestone: 'Berangkat Keluar Gudang', primary: true },
                { label: '3. Istirahat rest area', status: 'in_transit', milestone: 'Rest Area Tol', primary: false },
                { label: '4. Tiba di tujuan', status: 'arrived', milestone: 'Tiba di Lokasi Tujuan', primary: false },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleUpdateMilestone(m.status, m.milestone)}
                  className={`rounded-lg border p-3 text-left text-[12px] font-medium transition ${
                    m.primary
                      ? 'border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100/60'
                      : 'border-hairline text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload POD */}
          <div className="panel space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-stone-500" />
              <span className="text-[13px] font-semibold text-ink">Unggah surat jalan / POD</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500">
              Ambil foto lembar surat jalan yang telah ditandatangani dan distempel basah oleh
              penerima.
            </p>

            <form onSubmit={handleMockUploadPOD} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'bukti_terima_pod', label: 'Bukti terima (POD)' },
                  { key: 'surat_jalan', label: 'Surat jalan asli' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setDocumentType(opt.key as 'surat_jalan' | 'bukti_terima_pod')
                    }
                    className={`rounded-lg border p-2 text-[12px] font-medium transition ${
                      documentType === opt.key
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-hairline bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Keterangan foto (contoh: diterima security Pak Joko)"
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                className="field"
              />

              <button
                type="submit"
                disabled={isUploadingDoc}
                className="btn btn-ink w-full py-2.5"
              >
                <Upload className="h-3.5 w-3.5" />
                {isUploadingDoc ? 'Mengunggah…' : 'Unggah foto bukti terima'}
              </button>

              {uploadMessage && (
                <p className="rounded-lg bg-blue-50 px-3 py-2 text-center text-[11px] font-medium text-blue-700">
                  {uploadMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
