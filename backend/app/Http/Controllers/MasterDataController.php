<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Fleet;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class MasterDataController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::orderBy('name')->get();
        $vendors = Vendor::with(['fleets', 'drivers'])->orderBy('name')->get();
        $fleets = Fleet::with('vendor')->where('is_active', true)->get();
        $drivers = Driver::with('vendor')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'customers' => $customers,
                'vendors' => $vendors,
                'fleets' => $fleets,
                'drivers' => $drivers,
            ],
        ]);
    }
}
