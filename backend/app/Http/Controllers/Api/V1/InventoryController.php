<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Inventory;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $query = Inventory::where('shop_id', $shop->id)
            ->with(['product.images', 'product.category', 'branch']);

        if ($request->boolean('low_stock_only', false)) {
            $query->whereColumn('quantity', '<=', 'low_stock_threshold');
        }

        $inventories = $query->paginate(25);

        return response()->json($inventories);
    }

    public function update(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'branch_id' => 'nullable|exists:shop_branches,id',
        ]);

        $branchId = $validated['branch_id'] ?? null;

        $inventory = Inventory::firstOrNew([
            'product_id' => $productId,
            'shop_id' => $shop->id,
            'branch_id' => $branchId,
        ]);

        $qtyBefore = $inventory->exists ? $inventory->quantity : 0;
        $qtyAfter = $validated['quantity'];

        $inventory->quantity = $qtyAfter;
        if (isset($validated['low_stock_threshold'])) {
            $inventory->low_stock_threshold = $validated['low_stock_threshold'];
        }
        $inventory->save();

        InventoryMovement::create([
            'product_id' => $productId,
            'shop_id' => $shop->id,
            'branch_id' => $branchId,
            'user_id' => $user->id,
            'type' => 'ADJUSTMENT',
            'quantity_before' => $qtyBefore,
            'quantity_change' => $qtyAfter - $qtyBefore,
            'quantity_after' => $qtyAfter,
            'reason' => 'Direct inventory update',
        ]);

        return response()->json([
            'message' => 'Inventory updated',
            'data' => $inventory,
        ]);
    }

    public function adjust(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'adjustment' => 'required|integer', // positive or negative
            'type' => 'required|in:PURCHASE,RETURN,ADJUSTMENT,DAMAGE,INITIAL',
            'reason' => 'nullable|string',
            'branch_id' => 'nullable|exists:shop_branches,id',
        ]);

        $branchId = $validated['branch_id'] ?? null;

        $inventory = Inventory::firstOrCreate(
            ['product_id' => $productId, 'shop_id' => $shop->id, 'branch_id' => $branchId],
            ['quantity' => 0, 'low_stock_threshold' => 5]
        );

        $qtyBefore = $inventory->quantity;
        $inventory->quantity = max(0, $qtyBefore + $validated['adjustment']);
        $inventory->save();

        $movement = InventoryMovement::create([
            'product_id' => $productId,
            'shop_id' => $shop->id,
            'branch_id' => $branchId,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'quantity_before' => $qtyBefore,
            'quantity_change' => $validated['adjustment'],
            'quantity_after' => $inventory->quantity,
            'reason' => $validated['reason'] ?? 'Manual stock adjustment',
        ]);

        return response()->json([
            'message' => 'Stock adjusted successfully',
            'data' => [
                'inventory' => $inventory,
                'movement' => $movement,
            ],
        ]);
    }

    public function movements(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $movements = InventoryMovement::where('shop_id', $shop->id)
            ->with(['product:id,name_ar,name_en,part_number', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        return response()->json($movements);
    }
}
