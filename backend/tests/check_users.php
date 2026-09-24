<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

echo "=== POSTGRESQL USERS ===\n";
foreach (User::all() as $u) {
    echo "ID: {$u->id} | ClerkID: " . ($u->clerk_user_id ?: 'NULL') . " | Email: {$u->email} | Role: {$u->role} | Status: {$u->status}\n";
}

echo "\n=== ROLES ===\n";
foreach (Role::withCount('permissions')->get() as $r) {
    echo "Role: {$r->name} ({$r->display_name}) | Status: {$r->status} | is_system: " . ($r->is_system ? 'true' : 'false') . " | Permissions count: {$r->permissions_count}\n";
}

echo "\n=== SUPER_ADMIN EFFECTIVE PERMISSIONS ===\n";
$super = User::where('role', 'SUPER_ADMIN')->first();
if ($super) {
    $eff = $super->getEffectivePermissions();
    echo "Super Admin: {$super->email}, count: " . count($eff) . "\n";
    echo "Sample: " . implode(', ', array_slice($eff, 0, 10)) . "\n";
}
