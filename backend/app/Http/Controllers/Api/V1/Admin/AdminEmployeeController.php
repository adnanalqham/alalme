<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\ShopUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminEmployeeController extends Controller
{
    /**
     * Platform-wide employee registry across all shops
     */
    public function index(Request $request): JsonResponse
    {
        $query = ShopUser::with([
            'user:id,full_name,email,phone,avatar_url',
            'shop:id,name_ar,name_en,city',
            'branch:id,name_ar,name_en,city',
        ]);

        if ($shopId = $request->query('shop_id')) {
            $query->where('shop_id', $shopId);
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('user', function ($uq) use ($search) {
                $uq->where('full_name', 'ilike', "%{$search}%")
                   ->orWhere('email', 'ilike', "%{$search}%")
                   ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $employees = $query->orderBy('created_at', 'desc')->paginate(25);

        return response()->json($employees);
    }
}
