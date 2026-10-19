'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, Search } from 'lucide-react';
import { FinanceData } from '@/lib/types';
import { formatRupiah, updateCustomerPayment, updateVendorPayment } from '@/lib/api';

interface FinanceViewProps {
  financeData: FinanceData | null;
  onRefresh: () => void;
}

export default function FinanceView({ financeData, onRefresh }: FinanceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ar' | 'ap'>('ar');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);

  if (!financeData) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-3 py-24 text-stone-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-ink" />
        <p className="text-[13px]">Memuat piutang &amp; utang…</p>
      </div>
    );
  }

  const { summary, receivables, payables } = financeData;

  const handleToggleCustomerPayment = async (orderId: number, currentStatus: string) => {
    setLoadingOrderId(orderId);
    try {
      const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
      await updateCustomerPayment(orderId, nextStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleToggleVendorPayment = async (orderId: number, currentStatus: string) => {
    setLoadingOrderId(orderId);
    try {
      const nextStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
      await updateVendorPayment(orderId, nextStatus);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const filteredAR = receivables.filter(
    (r) =>
      r.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoice_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAP = payables.filter(
    (p) =>
      p.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nwc = summary.net_working_capital;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
            Piutang &amp; Utang
          </h1>
          <p className="mt-1 text-[13px] text-stone-500">
            Penagihan ke pelanggan industri dan kewajiban pembayaran ke vendor armada.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-hairline bg-stone-50 p-0.5">
          <button
            onClick={() => setActiveSubTab('ar')}
            className={`rounded-[6px] px-3.5 py-1.5 text-[12px] font-medium transition-all ${
              activeSubTab === 'ar' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Piutang ({summary.total_ar_count})
          </button>
          <button
            onClick={() => setActiveSubTab('ap')}
            className={`rounded-[6px] px-3.5 py-1.5 text-[12px] font-medium transition-all ${
              activeSubTab === 'ap' ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Utang vendor ({summary.total_ap_count})
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Piutang belum lunas</span>
            <ArrowUpRight className="h-4 w-4 text-stone-300" />
          </div>
          <p className="mt-2.5 text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">
            {formatRupiah(summary.total_ar_unpaid)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {summary.total_ar_count} faktur menunggu pelunasan
          </p>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Utang vendor belum dibayar</span>
            <ArrowDownLeft className="h-4 w-4 text-stone-300" />
          </div>
          <p className="mt-2.5 text-[22px] font-semibold tracking-[-0.02em] text-ink tnum">
            {formatRupiah(summary.total_ap_unpaid)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {summary.total_ap_count} tagihan jatuh tempo
          </p>
        </div>

        <div className="rounded-xl bg-ink p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-stone-400">
              Net working capital
            </span>
            <Wallet className="h-4 w-4 text-stone-500" />
          </div>
          <p
            className={`mt-2.5 text-[22px] font-semibold tracking-[-0.02em] tnum ${
              nwc >= 0 ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {formatRupiah(nwc)}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">Piutang dikurangi kewajiban vendor</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder={`Cari di ${activeSubTab === 'ar' ? 'piutang pelanggan' : 'utang vendor'}…`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="field pl-9"
        />
      </div>

      {/* AR table */}
      {activeSubTab === 'ar' && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Pelanggan</th>
                  <th>No. invoice</th>
                  <th className="text-right">Nilai tagihan</th>
                  <th>Jatuh tempo</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAR.map((item) => (
                  <tr key={item.order_id}>
                    <td className="font-semibold text-ink">{item.order_number}</td>
                    <td className="font-medium text-stone-800">{item.customer_name}</td>
                    <td className="font-mono text-[12px] text-stone-500">{item.invoice_no}</td>
                    <td className="text-right font-semibold text-ink tnum">
                      {formatRupiah(item.amount)}
                    </td>
                    <td>
                      {item.due_date ? (
                        <div>
                          <span className="font-medium text-stone-700">{item.due_date}</span>
                          {item.payment_status !== 'paid' && (
                            <span
                              className={`block text-[10px] font-medium ${
                                item.is_overdue ? 'text-rose-600' : 'text-stone-400'
                              }`}
                            >
                              {item.is_overdue
                                ? `Lewat ${Math.round(Math.abs(item.days_remaining))} hari`
                                : `Sisa ${Math.round(item.days_remaining)} hari`}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className={`chip ${item.payment_status === 'paid' ? 'chip-pos' : 'chip-warn'}`}>
                        {item.payment_status === 'paid' ? 'Lunas' : 'Belum lunas'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleCustomerPayment(item.order_id, item.payment_status)}
                        disabled={loadingOrderId === item.order_id}
                        className={`btn px-3 py-1.5 text-[11px] ${
                          item.payment_status === 'paid' ? 'btn-subtle' : 'btn-success'
                        }`}
                      >
                        {item.payment_status === 'paid' ? 'Batal lunas' : 'Tandai lunas'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AP table */}
      {activeSubTab === 'ap' && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Vendor rekanan</th>
                  <th>Rekening tujuan</th>
                  <th className="text-right">Biaya pokok</th>
                  <th className="text-right">Tambahan</th>
                  <th className="text-right">Total utang</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAP.map((item) => (
                  <tr key={item.order_id}>
                    <td className="font-semibold text-ink">{item.order_number}</td>
                    <td>
                      <p className="font-medium text-stone-800">{item.vendor_name}</p>
                      <span className="font-mono text-[10px] text-stone-400">Bill: {item.bill_no}</span>
                    </td>
                    <td className="text-[11px] text-stone-500">{item.bank_details}</td>
                    <td className="text-right text-stone-600 tnum">
                      {formatRupiah(item.vendor_base_cost)}
                    </td>
                    <td className="text-right tnum">
                      {item.additional_cost > 0 ? (
                        <span className="font-medium text-amber-600">
                          +{formatRupiah(item.additional_cost)}
                        </span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="text-right font-semibold text-ink tnum">
                      {formatRupiah(item.total_amount)}
                    </td>
                    <td className="text-center">
                      <span className={`chip ${item.payment_status === 'paid' ? 'chip-pos' : 'chip-neg'}`}>
                        {item.payment_status === 'paid' ? 'Sudah dibayar' : 'Belum dibayar'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleVendorPayment(item.order_id, item.payment_status)}
                        disabled={loadingOrderId === item.order_id}
                        className={`btn px-3 py-1.5 text-[11px] ${
                          item.payment_status === 'paid' ? 'btn-subtle' : 'btn-primary'
                        }`}
                      >
                        {item.payment_status === 'paid' ? 'Batalkan' : 'Transfer vendor'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
