<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * AuditService — creates immutable audit log entries for sensitive actions.
 */
class AuditService
{
    /**
     * Log an administrative action to the audit_logs table.
     *
     * @param string|null $userId Who performed the action
     * @param string $action The action name (SHOP_APPROVED, USER_SUSPENDED, etc.)
     * @param string|null $entityType The type of entity affected
     * @param string|null $entityId The ID of the entity affected
     * @param array $oldValues Previous state
     * @param array $newValues New state
     * @param Request|null $request HTTP request for IP/UA logging
     * @param string|null $notes Optional human-readable note
     */
    public static function log(
        ?string $userId,
        string $action,
        ?string $entityType = null,
        ?string $entityId = null,
        array $oldValues = [],
        array $newValues = [],
        ?Request $request = null,
        ?string $notes = null
    ): void {
        DB::table('audit_logs')->insert([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues ? json_encode($oldValues) : null,
            'new_values' => $newValues ? json_encode($newValues) : null,
            'ip_address' => $request?->ip(),
            'user_agent' => $request ? substr($request->userAgent() ?? '', 0, 500) : null,
            'notes' => $notes,
            'created_at' => now(),
        ]);
    }
}
