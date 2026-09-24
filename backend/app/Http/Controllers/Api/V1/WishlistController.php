<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Wishlist::where('user_id', $user->id)
            ->with(['product.images', 'product.shop', 'product.category'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function toggle(Request $request, $productId): JsonResponse
    {
        $user = $request->user();

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['in_wishlist' => false, 'message' => 'Removed from wishlist']);
        }

        Wishlist::create([
            'user_id' => $user->id,
            'product_id' => $productId,
        ]);

        return response()->json(['in_wishlist' => true, 'message' => 'Added to wishlist']);
    }
}
