<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer', 'vendor', 'fleet', 'driver', 'latestTrackingLog'])
            ->orderBy('id', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('under_margin')) {
            $isUnder = filter_var($request->under_margin, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_under_margin', $isUnder);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('customer_po_number', 'like', "%{$s}%")
                  ->orWhere('origin_city', 'like', "%{$s}%")
                  ->orWhere('destination_city', 'like', "%{$s}%")
                  ->orWhereHas('customer', function ($cq) use ($s) {
                      $cq->where('name', 'like', "%{$s}%");
                  });
            });
        }

        $orders = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'customer_po_number' => 'nullable|string',
            'origin_city' => 'required|string',
            'origin_address' => 'nullable|string',
            'destination_city' => 'required|string',
            'destination_address' => 'nullable|string',
            'cargo_description' => 'required|string',
            'cargo_weight_ton' => 'required|numeric|min:0',
            'vehicle_type_required' => 'required|string',
            'customer_price' => 'required|numeric|min:0',
            'vendor_cost' => 'nullable|numeric|min:0',
            'uang_jalan' => 'nullable|numeric|min:0',
            'bongkar_muat' => 'nullable|numeric|min:0',
            'waiting_time' => 'nullable|numeric|min:0',
            'pickup_date' => 'nullable|date',
            'eta_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Auto-generate order number PJU-xxx
        $count = Order::count() + 1;
        $orderNumber = sprintf('PJU-%03d', $count);

        $order = new Order();
        $order->fill($validated);
        $order->order_number = $orderNumber;
        $order->status = 'inquiry';
        $order->margin_alert_threshold = 10.0;
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Order {$orderNumber} berhasil dibuat.",
            'data' => $order->fresh(['customer', 'vendor', 'fleet', 'driver']),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['customer', 'vendor', 'fleet', 'driver', 'trackingLogs', 'documents'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $order,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'customer_price' => 'nullable|numeric|min:0',
            'vendor_cost' => 'nullable|numeric|min:0',
            'uang_jalan' => 'nullable|numeric|min:0',
            'bongkar_muat' => 'nullable|numeric|min:0',
            'waiting_time' => 'nullable|numeric|min:0',
            'other_cost' => 'nullable|numeric|min:0',
            'other_cost_note' => 'nullable|string',
            'margin_alert_threshold' => 'nullable|numeric|min:0',
            'cargo_description' => 'nullable|string',
            'cargo_weight_ton' => 'nullable|numeric|min:0',
            'origin_city' => 'nullable|string',
            'origin_address' => 'nullable|string',
            'destination_city' => 'nullable|string',
            'destination_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_payment_status' => 'nullable|string|in:unpaid,partial,paid',
            'vendor_payment_status' => 'nullable|string|in:unpaid,partial,paid',
            'customer_invoice_no' => 'nullable|string',
            'vendor_invoice_no' => 'nullable|string',
        ]);

        $order->fill($validated);
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Order {$order->order_number} berhasil diperbarui.",
            'data' => $order->fresh(['customer', 'vendor', 'fleet', 'driver']),
        ]);
    }

    public function dispatchOrder(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'fleet_id' => 'required|exists:fleets,id',
            'driver_id' => 'required|exists:drivers,id',
            'vendor_cost' => 'required|numeric|min:0',
            'uang_jalan' => 'nullable|numeric|min:0',
            'pickup_date' => 'nullable|date',
            'eta_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $order->fill($validated);
        $order->status = 'dispatched';
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Order {$order->order_number} berhasil di-dispatch ke armada.",
            'data' => $order->fresh(['customer', 'vendor', 'fleet', 'driver']),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:inquiry,quotation,po_confirmed,dispatched,loading,in_transit,arrived,delivered,completed,cancelled',
            'note' => 'nullable|string',
        ]);

        $order->status = $validated['status'];
        if ($validated['status'] === 'delivered' || $validated['status'] === 'completed') {
            if (!$order->delivered_at) {
                $order->delivered_at = Carbon::now();
            }
        }
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Status order {$order->order_number} berhasil diubah menjadi {$order->status}.",
            'data' => $order->fresh(['customer', 'vendor', 'fleet', 'driver']),
        ]);
    }

    public function exportCsv(): StreamedResponse
    {
        $orders = Order::with(['customer', 'vendor'])->orderBy('id', 'asc')->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="Laporan_Profit_Margin_PJU_' . date('Ymd_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            // Add UTF-8 BOM
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header matching Proposal page 3 & 4
            fputcsv($handle, [
                'No. Order',
                'Pelanggan',
                'No. PO',
                'Rute (Asal - Tujuan)',
                'Armada / Muatan',
                'Vendor Rekanan',
                'Harga Jual (Rp)',
                'Biaya Vendor (Rp)',
                'Biaya Tambahan (Rp)',
                'Laba Kotor (Rp)',
                'Margin (%)',
                'Status Margin',
                'Status Operasional',
                'Status Pembayaran Pelanggan',
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->customer?->name ?? '-',
                    $order->customer_po_number ?? '-',
                    "{$order->origin_city} - {$order->destination_city}",
                    $order->vehicle_type_required . ' (' . ($order->cargo_description ?? '-') . ')',
                    $order->vendor?->name ?? 'Belum Ditugaskan',
                    $order->customer_price,
                    $order->vendor_cost,
                    $order->total_additional_cost,
                    $order->gross_profit,
                    $order->margin_percentage . '%',
                    $order->is_under_margin ? 'DI BAWAH BATAS' : 'NORMAL',
                    strtoupper($order->status),
                    strtoupper($order->customer_payment_status),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }
}
