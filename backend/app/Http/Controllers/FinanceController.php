<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function getPayablesReceivables(): JsonResponse
    {
        $orders = Order::with(['customer', 'vendor'])
            ->whereNotNull('customer_price')
            ->orderBy('id', 'desc')
            ->get();

        $receivables = $orders->map(function ($order) {
            $isOverdue = false;
            $daysDiff = 0;
            if ($order->customer_due_date && $order->customer_payment_status !== 'paid') {
                $daysDiff = (int) round(Carbon::now()->diffInDays($order->customer_due_date, false));
                $isOverdue = $daysDiff < 0;
            }

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name ?? '-',
                'invoice_no' => $order->customer_invoice_no ?? '-',
                'amount' => $order->customer_price,
                'payment_status' => $order->customer_payment_status,
                'invoice_date' => $order->customer_invoice_date?->format('Y-m-d'),
                'due_date' => $order->customer_due_date?->format('Y-m-d'),
                'is_overdue' => $isOverdue,
                'days_remaining' => $daysDiff,
                'paid_at' => $order->customer_paid_at?->format('Y-m-d H:i'),
            ];
        });

        $payables = $orders->whereNotNull('vendor_id')->map(function ($order) {
            $totalVendorDue = $order->vendor_cost + $order->total_additional_cost;
            $isOverdue = false;
            $daysDiff = 0;
            if ($order->vendor_due_date && $order->vendor_payment_status !== 'paid') {
                $daysDiff = (int) round(Carbon::now()->diffInDays($order->vendor_due_date, false));
                $isOverdue = $daysDiff < 0;
            }

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'vendor_name' => $order->vendor?->name ?? '-',
                'bank_details' => $order->vendor ? "{$order->vendor->bank_name} - {$order->vendor->bank_account_no} (a.n. {$order->vendor->bank_account_name})" : '-',
                'bill_no' => $order->vendor_invoice_no ?? '-',
                'vendor_base_cost' => $order->vendor_cost,
                'additional_cost' => $order->total_additional_cost,
                'total_amount' => $totalVendorDue,
                'payment_status' => $order->vendor_payment_status,
                'due_date' => $order->vendor_due_date?->format('Y-m-d'),
                'is_overdue' => $isOverdue,
                'days_remaining' => $daysDiff,
                'paid_at' => $order->vendor_paid_at?->format('Y-m-d H:i'),
            ];
        })->values();

        $totalReceivableUnpaid = $receivables->where('payment_status', '!=', 'paid')->sum('amount');
        $totalPayableUnpaid = $payables->where('payment_status', '!=', 'paid')->sum('total_amount');
        $netWorkingCapital = $totalReceivableUnpaid - $totalPayableUnpaid;

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_ar_unpaid' => $totalReceivableUnpaid,
                    'total_ap_unpaid' => $totalPayableUnpaid,
                    'net_working_capital' => $netWorkingCapital,
                    'total_ar_count' => $receivables->where('payment_status', '!=', 'paid')->count(),
                    'total_ap_count' => $payables->where('payment_status', '!=', 'paid')->count(),
                ],
                'receivables' => $receivables,
                'payables' => $payables,
            ],
        ]);
    }

    public function updateCustomerPayment(Request $request, int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);
        $validated = $request->validate([
            'status' => 'required|in:unpaid,partial,paid',
            'invoice_no' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $order->customer_payment_status = $validated['status'];
        if (!empty($validated['invoice_no'])) {
            $order->customer_invoice_no = $validated['invoice_no'];
        }
        if (!empty($validated['due_date'])) {
            $order->customer_due_date = $validated['due_date'];
        }
        if ($validated['status'] === 'paid') {
            $order->customer_paid_at = Carbon::now();
        } else {
            $order->customer_paid_at = null;
        }
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Status pembayaran pelanggan order {$order->order_number} diperbarui.",
            'data' => $order,
        ]);
    }

    public function updateVendorPayment(Request $request, int $orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);
        $validated = $request->validate([
            'status' => 'required|in:unpaid,partial,paid',
            'bill_no' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $order->vendor_payment_status = $validated['status'];
        if (!empty($validated['bill_no'])) {
            $order->vendor_invoice_no = $validated['bill_no'];
        }
        if (!empty($validated['due_date'])) {
            $order->vendor_due_date = $validated['due_date'];
        }
        if ($validated['status'] === 'paid') {
            $order->vendor_paid_at = Carbon::now();
        } else {
            $order->vendor_paid_at = null;
        }
        $order->save();

        return response()->json([
            'status' => 'success',
            'message' => "Status pembayaran vendor order {$order->order_number} diperbarui.",
            'data' => $order,
        ]);
    }
}
