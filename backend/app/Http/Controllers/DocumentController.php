<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ShipmentDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'document_type' => 'required|in:surat_jalan,bukti_terima_pod,timbangan,invoice',
            'notes' => 'nullable|string',
            'uploaded_by_role' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB
            'file_name' => 'nullable|string',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($request->hasFile('file')) {
            $uploaded = $request->file('file');
            $path = $uploaded->store('documents', 'public');
            $fileName = $uploaded->getClientOriginalName();
            $fileUrl = Storage::url($path);
        } else {
            // Simulated / Mocked field upload from camera
            $fileName = $validated['file_name'] ?? 'DOC_' . strtoupper($validated['document_type']) . '_' . $order->order_number . '.jpg';
            $fileUrl = '/sample-docs/' . $fileName;
        }

        $document = ShipmentDocument::create([
            'order_id' => $order->id,
            'document_type' => $validated['document_type'],
            'file_name' => $fileName,
            'file_url' => $fileUrl,
            'notes' => $validated['notes'] ?? null,
            'uploaded_by_role' => $validated['uploaded_by_role'] ?? 'driver',
        ]);

        // If driver uploads POD, auto update status to 'delivered'
        if ($validated['document_type'] === 'bukti_terima_pod' && $order->status !== 'completed') {
            $order->status = 'delivered';
            $order->delivered_at = now();
            $order->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dokumen berhasil diunggah.',
            'data' => $document,
        ], 201);
    }
}
