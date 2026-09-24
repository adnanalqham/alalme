<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShopGroup;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Customer: List my orders.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('customer_id', $user->id)
            ->with(['items.product.images', 'shopGroups.shop:id,name_ar,name_en,phone,city'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($orders);
    }

    /**
     * Customer: Place a new order.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required_without:from_cart|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'from_cart' => 'nullable|boolean',
            'delivery_type' => 'required|in:PICKUP,SHOP_DELIVERY,DELIVERY_COMPANY',
            'delivery_address_id' => 'nullable|string',
            'delivery_notes' => 'nullable|string',
            'payment_method' => 'required|in:COD,BANK_TRANSFER,E_WALLET,CARD',
        ]);

        return DB::transaction(function () use ($user, $validated, $request) {
            $orderId = 'ord_' . Str::random(16);
            $orderNumber = 'ALA-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            // Gather items
            $itemsData = [];
            if (!empty($validated['from_cart'])) {
                $cart = Cart::where('user_id', $user->id)->first();
                if (!$cart) {
                    return response()->json(['error' => 'Cart is empty'], 422);
                }
                $cartItems = CartItem::where('cart_id', $cart->id)->with('product')->get();
                if ($cartItems->isEmpty()) {
                    return response()->json(['error' => 'Cart is empty'], 422);
                }
                foreach ($cartItems as $ci) {
                    $itemsData[] = [
                        'product' => $ci->product,
                        'quantity' => $ci->quantity,
                    ];
                }
            } else {
                foreach ($validated['items'] as $it) {
                    $product = Product::findOrFail($it['product_id']);
                    $itemsData[] = [
                        'product' => $product,
                        'quantity' => (int)$it['quantity'],
                    ];
                }
            }

            // Group by shop
            $byShop = [];
            $subtotal = 0;

            foreach ($itemsData as $entry) {
                $product = $entry['product'];
                $qty = $entry['quantity'];
                $itemSub = (float)$product->price * $qty;
                $subtotal += $itemSub;

                $byShop[$product->shop_id][] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => (float)$product->price,
                    'total_price' => $itemSub,
                ];
            }

            // Create Master Order
            $order = Order::create([
                'id' => $orderId,
                'customer_id' => $user->id,
                'order_number' => $orderNumber,
                'subtotal' => $subtotal,
                'delivery_fee' => 0,
                'discount' => 0,
                'tax' => 0,
                'total' => $subtotal,
                'currency_code' => 'USD',
                'status' => 'PENDING',
                'delivery_type' => $validated['delivery_type'],
                'delivery_address_id' => $validated['delivery_address_id'] ?? null,
                'delivery_notes' => $validated['delivery_notes'] ?? null,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'PENDING',
            ]);

            // Create Shop Groups & Order Items
            foreach ($byShop as $shopId => $shopItems) {
                $groupId = 'osg_' . Str::random(16);
                $groupSubtotal = array_sum(array_column($shopItems, 'total_price'));

                $shopGroup = OrderShopGroup::create([
                    'id' => $groupId,
                    'order_id' => $order->id,
                    'shop_id' => $shopId,
                    'subtotal' => $groupSubtotal,
                    'delivery_fee' => 0,
                    'total' => $groupSubtotal,
                    'status' => 'PENDING',
                    'delivery_type' => $validated['delivery_type'],
                ]);

                foreach ($shopItems as $item) {
                    $prod = $item['product'];
                    $qty = $item['quantity'];

                    OrderItem::create([
                        'order_id' => $order->id,
                        'order_shop_group_id' => $shopGroup->id,
                        'product_id' => $prod->id,
                        'shop_id' => $shopId,
                        'product_name_ar' => $prod->name_ar,
                        'product_name_en' => $prod->name_en,
                        'part_number' => $prod->part_number,
                        'oem_number' => $prod->oem_number,
                        'quantity' => $qty,
                        'unit_price' => $item['unit_price'],
                        'total_price' => $item['total_price'],
                        'currency_code' => 'USD',
                    ]);

                    // Deduct inventory & record movement
                    $inv = Inventory::where('product_id', $prod->id)->first();
                    if ($inv) {
                        $qtyBefore = $inv->quantity;
                        $inv->decrement('quantity', $qty);
                        $qtyAfter = $inv->quantity;

                        InventoryMovement::create([
                            'product_id' => $prod->id,
                            'shop_id' => $shopId,
                            'user_id' => $user->id,
                            'type' => 'SALE',
                            'quantity_before' => $qtyBefore,
                            'quantity_change' => -$qty,
                            'quantity_after' => $qtyAfter,
                            'reference_type' => 'order',
                            'reference_id' => $order->id,
                            'reason' => "Order #{$orderNumber}",
                        ]);
                    }
                }

                // Notify shop owner
                $shop = Shop::find($shopId);
                if ($shop && $shop->owner_id) {
                    Notification::create([
                        'id' => 'notif_' . Str::random(16),
                        'user_id' => $shop->owner_id,
                        'type' => 'new_order',
                        'title_ar' => "طلب جديد #{$orderNumber}",
                        'title_en' => "New Order #{$orderNumber}",
                        'body_ar' => "لديك طلب جديد بمبلغ \${$groupSubtotal}",
                        'body_en' => "You have a new order totaling \${$groupSubtotal}",
                        'data' => ['order_id' => $order->id, 'shop_group_id' => $shopGroup->id],
                    ]);
                }
            }

            // Record initial status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'PENDING',
                'changed_by' => $user->id,
                'notes' => 'Order placed by customer.',
            ]);

            // Clear cart if requested
            if (!empty($validated['from_cart'])) {
                $cart = Cart::where('user_id', $user->id)->first();
                if ($cart) {
                    CartItem::where('cart_id', $cart->id)->delete();
                }
            }

            return response()->json([
                'message' => 'Order created successfully',
                'data' => $order->load(['items', 'shopGroups.shop']),
            ], 201);
        });
    }

    /**
     * Customer: View single order.
     */
    public function show($id, Request $request): JsonResponse
    {
        $user = $request->user();

        $order = Order::where('customer_id', $user->id)
            ->with([
                'items.product.images',
                'shopGroups.shop:id,name_ar,name_en,phone,whatsapp,city',
                'statusHistory'
            ])
            ->findOrFail($id);

        return response()->json(['data' => $order]);
    }

    /**
     * Customer: Cancel order.
     */
    public function cancel($id, Request $request): JsonResponse
    {
        $user = $request->user();
        $order = Order::where('customer_id', $user->id)->findOrFail($id);

        if (!in_array($order->status, ['PENDING', 'CONFIRMED'])) {
            return response()->json([
                'error' => 'Conflict',
                'message' => 'Cannot cancel an order that is already being prepared or completed.',
            ], 409);
        }

        $order->update(['status' => 'CANCELLED']);
        OrderShopGroup::where('order_id', $order->id)->update(['status' => 'CANCELLED']);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => 'CANCELLED',
            'changed_by' => $user->id,
            'notes' => 'Cancelled by customer.',
        ]);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => $order->fresh(),
        ]);
    }

    /**
     * Shop Owner: View incoming orders.
     */
    public function shopOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $query = OrderShopGroup::where('shop_id', $shop->id)
            ->with(['order.customer:id,name,phone,email', 'items']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $groups = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($groups);
    }

    /**
     * Shop Owner: View single shop order.
     */
    public function shopOrder($id, Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $group = OrderShopGroup::where('shop_id', $shop->id)
            ->with(['order.customer', 'items.product.images'])
            ->findOrFail($id);

        return response()->json(['data' => $group]);
    }

    /**
     * Shop Owner: Confirm order.
     */
    public function confirm($id, Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $group = OrderShopGroup::where('shop_id', $shop->id)->findOrFail($id);
        $group->update(['status' => 'CONFIRMED']);

        // Check if all groups in order are confirmed to update master order
        $order = Order::find($group->order_id);
        if ($order) {
            $order->update(['status' => 'CONFIRMED']);
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'order_shop_group_id' => $group->id,
                'status' => 'CONFIRMED',
                'changed_by' => $user->id,
                'notes' => "Confirmed by shop {$shop->name_ar}",
            ]);
        }

        return response()->json([
            'message' => 'Order confirmed',
            'data' => $group->fresh(),
        ]);
    }

    /**
     * Shop Owner: Update status (PREPARING, READY, COMPLETED, CANCELLED).
     */
    public function updateShopGroupStatus(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:PREPARING,READY,OUT_FOR_DELIVERY,COMPLETED,CANCELLED',
            'notes' => 'nullable|string',
        ]);

        $group = OrderShopGroup::where('shop_id', $shop->id)->findOrFail($id);
        $group->update(['status' => $validated['status']]);

        $order = Order::find($group->order_id);
        if ($order) {
            $order->update(['status' => $validated['status']]);
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'order_shop_group_id' => $group->id,
                'status' => $validated['status'],
                'changed_by' => $user->id,
                'notes' => $validated['notes'] ?? "Status updated to {$validated['status']}",
            ]);
        }

        return response()->json([
            'message' => 'Status updated',
            'data' => $group->fresh(),
        ]);
    }
}
