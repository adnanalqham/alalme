<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\ShopCommission;
use App\Models\Shop;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminCommissionController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    /**
     * List shop commission agreements
     */
    public function index(Request $request): JsonResponse
    {
        $commissions = ShopCommission::with(['shop:id,name_ar,name_en,city,phone', 'creator:id,full_name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $commissions,
        ]);
    }

    /**
     * Set or create a commission for a shop
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'commission_type' => 'required|in:PERCENTAGE,FIXED',
            'commission_value' => 'required|numeric|min:0',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
        ]);

        $actor = $request->user();

        $commission = ShopCommission::create([
            'shop_id' => $validated['shop_id'],
            'commission_type' => $validated['commission_type'],
            'commission_value' => $validated['commission_value'],
            'effective_from' => $validated['effective_from'] ?? now(),
            'effective_to' => $validated['effective_to'] ?? null,
            'status' => $validated['status'] ?? 'ACTIVE',
            'created_by' => $actor->id,
        ]);

        $this->audit->log(
            $request,
            'COMMISSION_CREATED',
            'shop_commission',
            (string)$commission->id,
            null,
            $commission->toArray(),
            "Set commission for shop {$validated['shop_id']}: {$validated['commission_value']} ({$validated['commission_type']})"
        );

        return response()->json([
            'message' => 'Commission rule saved successfully',
            'data' => $commission->load('shop'),
        ], 201);
    }

    /**
     * Update an existing commission
     */
    public function update(Request $request, $id): JsonResponse
    {
        $commission = ShopCommission::findOrFail($id);
        $old = $commission->toArray();

        $validated = $request->validate([
            'commission_type' => 'sometimes|in:PERCENTAGE,FIXED',
            'commission_value' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
        ]);

        $commission->update($validated);

        $this->audit->log(
            $request,
            'COMMISSION_UPDATED',
            'shop_commission',
            (string)$commission->id,
            $old,
            $commission->fresh()->toArray(),
            "Updated commission rule #{$commission->id}"
        );

        return response()->json([
            'message' => 'Commission updated successfully',
            'data' => $commission->fresh()->load('shop'),
        ]);
    }

    /**
     * Delete a commission rule
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $commission = ShopCommission::findOrFail($id);
        $old = $commission->toArray();
        $commission->delete();

        $this->audit->log(
            $request,
            'COMMISSION_DELETED',
            'shop_commission',
            (string)$id,
            $old,
            null,
            "Deleted commission rule #{$id}"
        );

        return response()->json([
            'message' => 'Commission rule deleted successfully',
        ]);
    }
}
