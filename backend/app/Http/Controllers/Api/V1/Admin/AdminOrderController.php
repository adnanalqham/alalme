<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['customer:id,name,email,phone', 'shopGroups.shop:id,name_ar,name_en,city']);

        if ($search = $request->query('search')) {
            $query->where('order_number', 'ilike', "%{$search}%");
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($paymentStatus = $request->query('payment_status')) {
            $query->where('payment_status', $paymentStatus);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(25);

        return response()->json($orders);
    }

    public function show($id): JsonResponse
    {
        $order = Order::with([
            'customer',
            'items.product.images',
            'shopGroups.shop',
            'statusHistory.changer',
            'deliveryAddress',
        ])->findOrFail($id);

        return response()->json(['data' => $order]);
    }
}
