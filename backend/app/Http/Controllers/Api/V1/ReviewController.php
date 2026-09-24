<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Review;
use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    public function forShop($shopId): JsonResponse
    {
        $reviews = Review::where('shop_id', $shopId)
            ->where('status', 'APPROVED')
            ->with(['user:id,name,avatar_url'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($reviews);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'product_id' => 'nullable|exists:products,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'id' => 'rev_' . Str::random(16),
            'user_id' => $user->id,
            'shop_id' => $validated['shop_id'],
            'product_id' => $validated['product_id'] ?? null,
            'order_id' => $validated['order_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'status' => 'APPROVED', // Default auto-approve
        ]);

        // Update shop rating
        $avgRating = Review::where('shop_id', $validated['shop_id'])->where('status', 'APPROVED')->avg('rating');
        $countRating = Review::where('shop_id', $validated['shop_id'])->where('status', 'APPROVED')->count();

        Shop::where('id', $validated['shop_id'])->update([
            'rating' => round($avgRating, 2),
            'rating_count' => $countRating,
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'data' => $review->load('user:id,name,avatar_url'),
        ], 201);
    }
}
