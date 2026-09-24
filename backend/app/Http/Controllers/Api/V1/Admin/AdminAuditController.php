<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminAuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name,email');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($entityType = $request->query('entity_type')) {
            $query->where('entity_type', $entityType);
        }

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($logs);
    }

    public function show($id): JsonResponse
    {
        $log = AuditLog::with('user')->findOrFail($id);
        return response()->json(['data' => $log]);
    }
}
