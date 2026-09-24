<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Manufacturer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ManufacturerController extends Controller
{
    /**
     * List active auto parts manufacturers (Bosch, Denso, etc.).
     */
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $query = Manufacturer::where('is_active', true)->orderBy('name_en', 'asc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%");
            });
        }

        $manufacturers = $query->get();

        return response()->json(['data' => $manufacturers]);
    }
}
