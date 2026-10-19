'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Eye,
  Send,
  Download,
  X,
} from 'lucide-react';
import { MasterData, Order } from '@/lib/types';
import { createOrder, dispatchOrder, formatPercent, formatRupiah, updateOrderStatus } from '@/lib/api';

interface OrderManagementProps {
  orders: Order[];
  masterData: MasterData | null;
  onRefresh: () => void;
  onSelectOrder: (order: Order) => void;
  initialFilterUnderMargin?: boolean;
}

export default function OrderManagement({
  orders,
  masterData,
  onRefresh,
  onSelectOrder,
  initialFilterUnderMargin = false,
}: OrderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterUnderMargin, setFilterUnderMargin] = useState<boolean>(initialFilterUnderMargin);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_po_number: '',
    origin_city: 'Bekasi Barat',
    origin_address: 'Jl. Oscar 1 Blok C7 No. 20, Harapan Baru 2, Bekasi Barat',
    destination_city: '',
    destination_address: '',
    cargo_description: '',
    cargo_weight_ton: 10,
    vehicle_type_required: 'Wingbox',
    customer_price: 10000000,
    vendor_cost: 8500000,
    uang_jalan: 0,
    notes: '',
  });

  const [dispatchData, setDispatchData] = useState({
    vendor_id: '',
    fleet_id: '',
    driver_id: '',
    vendor_cost: 0,
    uang_jalan: 0,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_po_number &&
        order.customer_po_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name &&
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesMargin = !filterUnderMargin || order.is_under_margin;

    return matchesSearch && matchesStatus && matchesMargin;
  });

  const previewGrossProfit =
    (Number(formData.customer_price) || 0) -
    ((Number(formData.vendor_cost) || 0) + (Number(formData.uang_jalan) || 0));
  const previewMargin =
    Number(formData.customer_price) > 0
      ? (previewGrossProfit / Number(formData.customer_price)) * 100
      : 0;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.customer_id) {
      setFormError('Pilih pelanggan terlebih dahulu.');
      return;
    }
    if (!formData.destination_city || !formData.cargo_description) {
      setFormError('Lengkapi kota tujuan dan deskripsi muatan.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        customer_id: Number(formData.customer_id),
        customer_po_number: formData.customer_po_number || null,
        origin_city: formData.origin_city,
        origin_address: formData.origin_address,
        destination_city: formData.destination_city,
        destination_address: formData.destination_address,
        cargo_description: formData.cargo_description,
        cargo_weight_ton: Number(formData.cargo_weight_ton),
        vehicle_type_required: formData.vehicle_type_required,
        customer_price: Number(formData.customer_price),
        vendor_cost: Number(formData.vendor_cost),
        uang_jalan: Number(formData.uang_jalan),
        notes: formData.notes,
      });
      setIsCreateModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat order baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDispatchModal = (order: Order) => {
    setSelectedOrderForDispatch(order);
    setDispatchData({
      vendor_id: order.vendor_id ? String(order.vendor_id) : '',
      fleet_id: order.fleet_id ? String(order.fleet_id) : '',
      driver_id: order.driver_id ? String(order.driver_id) : '',
      vendor_cost: order.vendor_cost || 0,
      uang_jalan: order.uang_jalan || 0,
      notes: '',
    });
    setIsDispatchModalOpen(true);
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;
    if (!dispatchData.vendor_id || !dispatchData.fleet_id || !dispatchData.driver_id) {
      alert('Pilih vendor, nomor armada, dan driver.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatchOrder(selectedOrderForDispatch.id, {
        vendor_id: Number(dispatchData.vendor_id),
        fleet_id: Number(dispatchData.fleet_id),
        driver_id: Number(dispatchData.driver_id),
        vendor_cost: Number(dispatchData.vendor_cost),
        uang_jalan: Number(dispatchData.uang_jalan),
        notes: dispatchData.notes,
      });
      setIsDispatchModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menugaskan armada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Manajemen Order
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Alur lengkap: inquiry → PO → penugasan vendor → pengiriman → invoice &amp; pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://127.0.0.1:8000/api/orders/export-csv"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </a>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus className="h-3.5 w-3.5" />
            <span>Input order</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[240px] grow sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari no. order, PO, rute, atau pelanggan…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-9"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="field w-auto"
        >
          <option value="all">Semua status</option>
          <option value="inquiry">Inquiry / Quotation</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_transit">Dalam perjalanan</option>
          <option value="delivered">Tiba di tujuan (POD)</option>
          <option value="completed">Selesai</option>
        </select>

        <button
          onClick={() => setFilterUnderMargin(!filterUnderMargin)}
          className={`btn border ${
            filterUnderMargin
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-hairline bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          <AlertTriangle
            className={`h-3.5 w-3.5 ${filterUnderMargin ? 'text-rose-600' : 'text-stone-400'}`}
          />
          <span>Margin &lt; 10%</span>
        </button>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Pelanggan &amp; PO</th>
                <th>Rute</th>
                <th className="text-right">Harga jual</th>
                <th className="text-right">Biaya vendor</th>
                <th className="text-right">Tambahan</th>
                <th className="text-right">Laba kotor</th>
                <th className="text-center">Margin</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    Tidak ada order yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUnder = order.is_under_margin;
                  return (
                    <tr key={order.id} className={isUnder ? 'bg-rose-50/30' : ''}>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-ink">{order.order_number}</span>
                          {isUnder && (
                            <span title="Margin di bawah target">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-stone-400">
                          {order.fleet?.plate_number || 'Belum ada armada'}
                        </span>
                      </td>

                      <td>
                        <p className="max-w-[150px] truncate font-medium text-stone-800">
                          {order.customer?.name}
                        </p>
                        <p className="font-mono text-[10px] text-stone-400">
                          {order.customer_po_number || '-'}
                        </p>
                      </td>

                      <td>
                        <span className="font-medium text-stone-800">
                          {order.origin_city} → {order.destination_city}
                        </span>
                        <p className="max-w-[150px] truncate text-[11px] text-stone-400">
                          {order.vehicle_type_required} · {order.cargo_description}
                        </p>
                      </td>

                      <td className="text-right font-medium text-ink tnum">
                        {formatRupiah(order.customer_price)}
                      </td>

                      <td className="text-right text-stone-600 tnum">
                        {formatRupiah(order.vendor_cost)}
                        {order.vendor && (
                          <span className="ml-auto block max-w-[120px] truncate text-[10px] text-stone-400">
                            {order.vendor.name}
                          </span>
                        )}
                      </td>

                      <td className="text-right tnum">
                        {order.total_additional_cost > 0 ? (
                          <span className="font-medium text-amber-600">
                            +{formatRupiah(order.total_additional_cost)}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      <td className="text-right font-semibold text-emerald-700 tnum">
                        {formatRupiah(order.gross_profit)}
                      </td>

                      <td className="text-center">
                        <span className={`chip ${isUnder ? 'chip-neg' : 'chip-pos'}`}>
                          {formatPercent(order.margin_percentage)}
                        </span>
                      </td>

                      <td className="text-center">
                        <select
                          value={order.status}
                          onChange={(e) => handleQuickStatusChange(order.id, e.target.value)}
                          className="rounded-md border border-hairline bg-white px-2 py-1 text-[11px] font-medium text-stone-700 outline-none transition hover:border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                        >
                          <option value="inquiry">Inquiry</option>
                          <option value="quotation">Quotation</option>
                          <option value="po_confirmed">PO Confirmed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="in_transit">In Transit</option>
                          <option value="arrived">Tiba Tujuan</option>
                          <option value="delivered">POD Selesai</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>

                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectOrder(order)}
                            title="Lihat detail & tracking"
                            className="rounded-md border border-hairline bg-white p-1.5 text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {(!order.fleet_id ||
                            order.status === 'inquiry' ||
                            order.status === 'quotation') && (
                            <button
                              onClick={() => openDispatchModal(order)}
                              title="Tugaskan vendor & armada"
                              className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              <Send className="h-3 w-3" />
                              Dispatch
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: create order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-[var(--shadow-float)]">
            <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Order / Quotation baru</h3>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  Margin kotor dihitung otomatis sebelum konfirmasi.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-2 text-[12px] text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Pelanggan</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="field"
                    required
                  >
                    <option value="">— Pilih pelanggan —</option>
                    {masterData?.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label mb-1.5">Nomor PO pelanggan</label>
                  <input
                    type="text"
                    placeholder="PO-CPA-2026-901"
                    value={formData.customer_po_number}
                    onChange={(e) => setFormData({ ...formData, customer_po_number: e.target.value })}
                    className="field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label mb-1.5">Kota asal</label>
                  <input
                    type="text"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    className="field"
                    required
                  />
                </div>

                <div>
                  <label className="label mb-1.5">Kota tujuan</label>
                  <input
                    type="text"
                    placeholder="Surabaya / Semarang / Medan"
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                    className="field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="label mb-1.5">Deskripsi muatan</label>
                  <input
                    type="text"
                    placeholder="Fast moving consumer goods (1.500 karton)"
                    value={formData.cargo_description}
                    onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                    className="field"
                    required
                  />
                </div>

                <div>
                  <label className="label mb-1.5">Tipe armada</label>
                  <select
                    value={formData.vehicle_type_required}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicle_type_required: e.target.value })
                    }
                    className="field"
                  >
                    <option value="Pickup">Pickup</option>
                    <option value="CDE">CDE (Colt Diesel Engkel)</option>
                    <option value="CDD">CDD (Colt Diesel Double)</option>
                    <option value="CDD Long">CDD Long</option>
                    <option value="Fuso">Fuso</option>
                    <option value="Wingbox">Wingbox</option>
                    <option value="Tronton">Tronton</option>
                    <option value="Trailer 40ft">Trailer 40ft</option>
                    <option value="Lowbed">Lowbed</option>
                  </select>
                </div>
              </div>

              {/* Financial preview */}
              <div className="rounded-lg border border-hairline bg-stone-50/60 p-4">
                <span className="eyebrow mb-3 block">Kalkulasi finansial</span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="label mb-1.5">
                      Harga jual (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.customer_price}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_price: Number(e.target.value) })
                      }
                      className="field bg-white font-medium tnum"
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-1.5">
                      Biaya vendor pokok (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.vendor_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor_cost: Number(e.target.value) })
                      }
                      className="field bg-white tnum"
                    />
                  </div>
                  <div>
                    <label className="label mb-1.5">
                      Biaya tambahan (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.uang_jalan}
                      onChange={(e) =>
                        setFormData({ ...formData, uang_jalan: Number(e.target.value) })
                      }
                      className="field bg-white tnum"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-[12px]">
                  <span className="text-stone-500">
                    Estimasi laba kotor{' '}
                    <strong className="ml-1 font-semibold text-emerald-700 tnum">
                      {formatRupiah(previewGrossProfit)}
                    </strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-stone-500">Margin proyeksi</span>
                    <span className={`chip ${previewMargin >= 10 ? 'chip-pos' : 'chip-neg'}`}>
                      {formatPercent(previewMargin)}
                    </span>
                  </span>
                </div>
              </div>

              <div>
                <label className="label mb-1.5">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Instruksi muat, catatan pengiriman, dsb."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="field resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-hairline pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-subtle"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menyimpan…' : 'Buat order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: dispatch */}
      {isDispatchModalOpen && selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="panel w-full max-w-lg p-6 shadow-[var(--shadow-float)]">
            <div className="flex items-start justify-between gap-4 border-b border-hairline pb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-ink">
                  Dispatch armada · {selectedOrderForDispatch.order_number}
                </h3>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  {selectedOrderForDispatch.origin_city} → {selectedOrderForDispatch.destination_city}
                </p>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label mb-1.5">Vendor rekanan</label>
                <select
                  value={dispatchData.vendor_id}
                  onChange={(e) => setDispatchData({ ...dispatchData, vendor_id: e.target.value })}
                  className="field"
                  required
                >
                  <option value="">— Pilih vendor —</option>
                  {masterData?.vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.fleets?.length || 0} unit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1.5">Nomor polisi</label>
                  <select
                    value={dispatchData.fleet_id}
                    onChange={(e) => setDispatchData({ ...dispatchData, fleet_id: e.target.value })}
                    className="field"
                    required
                  >
                    <option value="">— Pilih armada —</option>
                    {masterData?.fleets
                      .filter(
                        (f) => !dispatchData.vendor_id || String(f.vendor_id) === dispatchData.vendor_id
                      )
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.plate_number} ({f.vehicle_type})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="label mb-1.5">Pengemudi</label>
                  <select
                    value={dispatchData.driver_id}
                    onChange={(e) => setDispatchData({ ...dispatchData, driver_id: e.target.value })}
                    className="field"
                    required
                  >
                    <option value="">— Pilih driver —</option>
                    {masterData?.drivers
                      .filter(
                        (d) => !dispatchData.vendor_id || String(d.vendor_id) === dispatchData.vendor_id
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1.5">Biaya vendor (Rp)</label>
                  <input
                    type="number"
                    value={dispatchData.vendor_cost}
                    onChange={(e) =>
                      setDispatchData({ ...dispatchData, vendor_cost: Number(e.target.value) })
                    }
                    className="field tnum"
                    required
                  />
                </div>

                <div>
                  <label className="label mb-1.5">Uang jalan / tol (Rp)</label>
                  <input
                    type="number"
                    value={dispatchData.uang_jalan}
                    onChange={(e) =>
                      setDispatchData({ ...dispatchData, uang_jalan: Number(e.target.value) })
                    }
                    className="field tnum"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-hairline pt-4">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="btn btn-subtle"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menugaskan…' : 'Konfirmasi dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
