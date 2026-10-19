import { DashboardSummary, FinanceData, MasterData, Order, ShipmentDocument } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${Number(value).toFixed(1).replace('.', ',')}%`;
}

export function formatDateWIB(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB';
  } catch {
    return dateStr;
  }
}

export async function fetchDashboardSummary(period: string = 'all'): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary?period=${period}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil ringkasan dashboard');
  const json = await res.json();
  return json.data;
}

export async function fetchOrders(params: {
  status?: string;
  under_margin?: boolean;
  search?: string;
  customer_id?: number;
  vendor_id?: number;
} = {}): Promise<Order[]> {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.under_margin !== undefined) query.append('under_margin', String(params.under_margin));
  if (params.search) query.append('search', params.search);
  if (params.customer_id) query.append('customer_id', String(params.customer_id));
  if (params.vendor_id) query.append('vendor_id', String(params.vendor_id));

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil daftar order');
  const json = await res.json();
  return json.data;
}

export async function fetchOrderDetail(id: number): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil detail order');
  const json = await res.json();
  return json.data;
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal membuat order baru');
  }
  const json = await res.json();
  return json.data;
}

export async function updateOrder(id: number, data: Partial<Order>): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal memperbarui order');
  const json = await res.json();
  return json.data;
}

export async function dispatchOrder(
  id: number,
  data: {
    vendor_id: number;
    fleet_id: number;
    driver_id: number;
    vendor_cost: number;
    uang_jalan?: number;
    pickup_date?: string;
    eta_date?: string;
    notes?: string;
  }
): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal menugaskan armada');
  const json = await res.json();
  return json.data;
}

export async function updateOrderStatus(id: number, status: string, note?: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) throw new Error('Gagal mengubah status');
  const json = await res.json();
  return json.data;
}

export async function fetchActiveShipments(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/tracking/active`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil unit aktif');
  const json = await res.json();
  return json.data;
}

export async function updateDriverLocation(data: {
  order_id: number;
  lat: number;
  lng: number;
  speed_kmh?: number;
  location_name?: string;
  status_milestone?: string;
  note?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/tracking/update-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal memperbarui lokasi');
}

export async function publicTrackOrder(code: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/public/track/${encodeURIComponent(code)}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Order / Resi tidak ditemukan');
  }
  const json = await res.json();
  return json.data;
}

export async function fetchFinanceData(): Promise<FinanceData> {
  const res = await fetch(`${API_BASE}/finance/payables-receivables`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil data keuangan');
  const json = await res.json();
  return json.data;
}

export async function updateCustomerPayment(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/finance/orders/${orderId}/customer-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui pembayaran pelanggan');
}

export async function updateVendorPayment(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/finance/orders/${orderId}/vendor-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui pembayaran vendor');
}

export async function uploadDocument(data: {
  order_id: number;
  document_type: string;
  file_name?: string;
  notes?: string;
  uploaded_by_role?: string;
}): Promise<ShipmentDocument> {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal mengunggah dokumen');
  const json = await res.json();
  return json.data;
}

export async function fetchMasterData(): Promise<MasterData> {
  const res = await fetch(`${API_BASE}/master-data`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil data master');
  const json = await res.json();
  return json.data;
}
