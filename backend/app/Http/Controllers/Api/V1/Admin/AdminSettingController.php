<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminSettingController extends Controller
{
    /**
     * GET /api/v1/admin/settings
     * List all platform settings, optionally filtered by group.
     */
    public function index(Request $request): JsonResponse
    {
        $group = $request->query('group');

        $query = Setting::query();
        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        // Also return grouped structure for UI convenience
        $grouped = $settings->groupBy('group');

        return response()->json([
            'settings' => $settings,
            'grouped' => $grouped,
        ]);
    }

    /**
     * PUT /api/v1/admin/settings
     * Bulk or batch update settings.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('settings.update')) {
            return response()->json(['error' => 'Forbidden: You lack settings.update permission.'], 403);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        $updated = [];
        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            if ($setting) {
                $oldVal = $setting->value;
                $setting->value = $item['value'];
                $setting->updated_by = $user?->id ?? 'system';
                $setting->save();

                AuditLog::create([
                    'user_id' => $user?->id ?? 'system',
                    'action' => 'UPDATE',
                    'entity_type' => 'Setting',
                    'entity_id' => (string) $setting->id,
                    'old_values' => ['key' => $setting->key, 'value' => $oldVal],
                    'new_values' => ['key' => $setting->key, 'value' => $item['value']],
                    'ip_address' => $request->ip(),
                ]);

                $updated[] = $setting;
            } else {
                // Create if doesn't exist
                $newSetting = Setting::create([
                    'key' => $item['key'],
                    'value' => $item['value'],
                    'group' => $item['group'] ?? 'general',
                    'updated_by' => $user?->id ?? 'system',
                ]);
                $updated[] = $newSetting;
            }
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'updated' => $updated,
        ]);
    }
}
