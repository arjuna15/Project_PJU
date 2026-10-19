<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Order;
use App\Models\TrackingLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackingController extends Controller
{
    public function getActiveShipments(): JsonResponse
    {
        $activeOrders = Order::with(['customer', 'vendor', 'fleet', 'driver', 'latestTrackingLog'])
            ->whereIn('status', ['dispatched', 'loading', 'in_transit', 'arrived'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $activeOrders,
        ]);
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'speed_kmh' => 'nullable|numeric',
            'heading' => 'nullable|integer',
            'location_name' => 'nullable|string',
            'status_milestone' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $log = TrackingLog::create([
            'order_id' => $order->id,
            'driver_id' => $order->driver_id,
            'lat' => $validated['lat'],
            'lng' => $validated['lng'],
            'speed_kmh' => $validated['speed_kmh'] ?? 0,
            'heading' => $validated['heading'] ?? 0,
            'location_name' => $validated['location_name'] ?? 'Pembaruan GPS Lapangan',
            'status_milestone' => $validated['status_milestone'] ?? 'Dalam Perjalanan',
            'note' => $validated['note'] ?? null,
        ]);

        // Update driver's last known location
        if ($order->driver_id) {
            Driver::where('id', $order->driver_id)->update([
                'current_lat' => $validated['lat'],
                'current_lng' => $validated['lng'],
                'last_location_update' => Carbon::now(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Lokasi GPS pengemudi berhasil diperbarui.',
            'data' => $log,
        ], 201);
    }

    public function publicTrack(string $code): JsonResponse
    {
        $order = Order::with(['customer:id,name', 'fleet:id,plate_number,vehicle_type', 'trackingLogs', 'documents'])
            ->where('order_number', $code)
            ->orWhere('customer_po_number', $code)
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => "Order atau No PO '{$code}' tidak ditemukan di sistem PJU.",
            ], 404);
        }

        // Return customer safe data (excluding sensitive vendor cost & profit)
        return response()->json([
            'status' => 'success',
            'data' => [
                'order_number' => $order->order_number,
                'customer_po_number' => $order->customer_po_number,
                'customer_name' => $order->customer?->name,
                'origin_city' => $order->origin_city,
                'origin_address' => $order->origin_address,
                'destination_city' => $order->destination_city,
                'destination_address' => $order->destination_address,
                'cargo_description' => $order->cargo_description,
                'cargo_weight_ton' => $order->cargo_weight_ton,
                'vehicle_type_required' => $order->vehicle_type_required,
                'plate_number' => $order->fleet?->plate_number,
                'status' => $order->status,
                'pickup_date' => $order->pickup_date,
                'eta_date' => $order->eta_date,
                'delivered_at' => $order->delivered_at,
                'tracking_logs' => $order->trackingLogs,
                'documents' => $order->documents->where('document_type', '!=', 'invoice')->values(),
            ],
        ]);
    }
}
