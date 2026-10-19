<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;

// 1. Dashboard & Profit/Margin Analytics
Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

// 2. Order Management & Profit Monitoring
Route::get('/orders/export-csv', [OrderController::class, 'exportCsv']);
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::put('/orders/{id}', [OrderController::class, 'update']);
Route::post('/orders/{id}/dispatch', [OrderController::class, 'dispatchOrder']);
Route::post('/orders/{id}/status', [OrderController::class, 'updateStatus']);

// 3. Live GPS Unit Tracking & Driver Reporting
Route::get('/tracking/active', [TrackingController::class, 'getActiveShipments']);
Route::post('/tracking/update-location', [TrackingController::class, 'updateLocation']);
Route::get('/public/track/{code}', [TrackingController::class, 'publicTrack']);

// 4. Finance (Piutang Pelanggan & Utang Vendor)
Route::get('/finance/payables-receivables', [FinanceController::class, 'getPayablesReceivables']);
Route::post('/finance/orders/{id}/customer-payment', [FinanceController::class, 'updateCustomerPayment']);
Route::post('/finance/orders/{id}/vendor-payment', [FinanceController::class, 'updateVendorPayment']);

// 5. Digital Documents (Surat Jalan, Bukti Terima POD)
Route::post('/documents', [DocumentController::class, 'store']);

// 6. Master Data (Customers, Vendors, Fleets, Drivers)
Route::get('/master-data', [MasterDataController::class, 'index']);
