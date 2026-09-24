<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class CartController extends Controller
{
    protected function getOrCreateCart($user): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['id' => 'cart_' . Str::random(16)]
        );
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $cart->load([
            'items.product.images',
            'items.product.category:id,name_ar,name_en',
            'items.product.manufacturer:id,name_ar,name_en',
            'items.shop:id,name_ar,name_en,city'
        ]);

        $subtotal = 0;
        $items = [];

        foreach ($cart->items as $item) {
            if ($item->product) {
                $itemTotal = (float)$item->product->price * $item->quantity;
                $subtotal += $itemTotal;
                $items[] = [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'shop_id' => $item->shop_id,
                    'quantity' => $item->quantity,
                    'unit_price' => (float)$item->product->price,
                    'total_price' => round($itemTotal, 2),
                    'product' => $item->product,
                    'shop' => $item->shop,
                ];
            }
        }

        return response()->json([
            'data' => [
                'cart_id' => $cart->id,
                'items' => $items,
                'item_count' => count($items),
                'subtotal' => round($subtotal, 2),
                'currency' => 'USD',
            ],
        ]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $qty = $validated['quantity'] ?? 1;

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $item->increment('quantity', $qty);
        } else {
            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'shop_id' => $product->shop_id,
                'quantity' => $qty,
            ]);
        }

        return response()->json([
            'message' => 'Item added to cart',
            'data' => $item->fresh()->load('product'),
        ], 201);
    }

    public function updateItem(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $item->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Cart item updated',
            'data' => $item,
        ]);
    }

    public function removeItem(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    public function clear(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = $this->getOrCreateCart($user);

        CartItem::where('cart_id', $cart->id)->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
