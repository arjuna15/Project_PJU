export interface Customer {
  id: number;
  name: string;
  code: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  payment_term_days: number;
}

export interface Vendor {
  id: number;
  name: string;
  code: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  bank_name: string | null;
  bank_account_no: string | null;
  bank_account_name: string | null;
  payment_term_days: number;
  fleets?: Fleet[];
  drivers?: Driver[];
}

export interface Fleet {
  id: number;
  vendor_id: number;
  plate_number: string;
  vehicle_type: string;
  capacity_ton: number;
  is_active: boolean;
  vendor?: Vendor;
}

export interface Driver {
  id: number;
  vendor_id: number | null;
  name: string;
  phone: string;
  sim_number: string | null;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update: string | null;
  status: string;
  vendor?: Vendor;
}

export interface TrackingLog {
  id: number;
  order_id: number;
  driver_id: number | null;
  lat: number;
  lng: number;
  speed_kmh: number;
  heading: number | null;
  location_name: string | null;
  status_milestone: string | null;
  note: string | null;
  created_at: string;
}

export interface ShipmentDocument {
  id: number;
  order_id: number;
  document_type: 'surat_jalan' | 'bukti_terima_pod' | 'timbangan' | 'invoice';
  file_name: string;
  file_url: string;
  notes: string | null;
  uploaded_by_role: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer_po_number: string | null;
  origin_city: string;
  origin_address: string | null;
  destination_city: string;
  destination_address: string | null;
  cargo_description: string | null;
  cargo_weight_ton: number;
  vehicle_type_required: string;
  vendor_id: number | null;
  fleet_id: number | null;
  driver_id: number | null;
  status: 'inquiry' | 'quotation' | 'po_confirmed' | 'dispatched' | 'loading' | 'in_transit' | 'arrived' | 'delivered' | 'completed' | 'cancelled';
  pickup_date: string | null;
  eta_date: string | null;
  delivered_at: string | null;
  customer_price: number;
  vendor_cost: number;
  uang_jalan: number;
  bongkar_muat: number;
  waiting_time: number;
  other_cost: number;
  other_cost_note: string | null;
  total_additional_cost: number;
  gross_profit: number;
  margin_percentage: number;
  margin_alert_threshold: number;
  is_under_margin: boolean;
  customer_payment_status: 'unpaid' | 'partial' | 'paid';
  customer_invoice_no: string | null;
  customer_invoice_date: string | null;
  customer_due_date: string | null;
  customer_paid_at: string | null;
  vendor_payment_status: 'unpaid' | 'partial' | 'paid';
  vendor_invoice_no: string | null;
  vendor_due_date: string | null;
  vendor_paid_at: string | null;
  notes: string | null;
  customer_name?: string;
  plate_number?: string;
  customer?: Customer;
  vendor?: Vendor;
  fleet?: Fleet;
  driver?: Driver;
  tracking_logs?: TrackingLog[];
  latest_tracking_log?: TrackingLog;
  documents?: ShipmentDocument[];
}

export interface DashboardSummary {
  overview: {
    total_revenue: number;
    total_vendor_cost: number;
    total_additional_cost: number;
    total_gross_profit: number;
    avg_margin_percentage: number;
    active_orders_count: number;
    completed_orders_count: number;
    under_margin_count: number;
    total_receivables: number;
    total_payables: number;
  };
  route_ranking: Array<{
    route_name: string;
    total_trips: number;
    total_revenue: number;
    total_profit: number;
    avg_margin: number;
  }>;
  vendor_ranking: Array<{
    id: number;
    name: string;
    total_trips: number;
    total_profit: number;
    avg_margin: number;
  }>;
  customer_ranking: Array<{
    id: number;
    name: string;
    total_orders: number;
    total_revenue: number;
    total_profit: number;
    avg_margin: number;
  }>;
  monthly_trends: Array<{
    month: string;
    revenue: number;
    vendor_cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface FinanceData {
  summary: {
    total_ar_unpaid: number;
    total_ap_unpaid: number;
    net_working_capital: number;
    total_ar_count: number;
    total_ap_count: number;
  };
  receivables: Array<{
    order_id: number;
    order_number: string;
    customer_name: string;
    invoice_no: string;
    amount: number;
    payment_status: 'unpaid' | 'partial' | 'paid';
    invoice_date: string | null;
    due_date: string | null;
    is_overdue: boolean;
    days_remaining: number;
    paid_at: string | null;
  }>;
  payables: Array<{
    order_id: number;
    order_number: string;
    vendor_name: string;
    bank_details: string;
    bill_no: string;
    vendor_base_cost: number;
    additional_cost: number;
    total_amount: number;
    payment_status: 'unpaid' | 'partial' | 'paid';
    due_date: string | null;
    is_overdue: boolean;
    days_remaining: number;
    paid_at: string | null;
  }>;
}

export interface MasterData {
  customers: Customer[];
  vendors: Vendor[];
  fleets: Fleet[];
  drivers: Driver[];
}
