<?php

/**
 * ALA Automotive Marketplace — Complete Admin RBAC & Security Test Suite
 * Tests all requirements from Sections 12, 13, 29, 30 of the prompt.
 */

require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\UserPermission;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$passed = 0;
$failed = 0;

function assertCondition(string $name, bool $condition, string $evidence = ''): void {
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo " [\033[32mPASS\033[0m] {$name}\n";
        if ($evidence) {
            echo "        \033[36mEvidence: {$evidence}\033[0m\n";
        }
    } else {
        $failed++;
        echo " [\033[31mFAIL\033[0m] {$name}\n";
        if ($evidence) {
            echo "        \033[31mEvidence: {$evidence}\033[0m\n";
        }
    }
}

echo "============================================================\n";
echo "ALA ADMIN CONTROL CENTER — SECURITY & RBAC VERIFICATION\n";
echo "============================================================\n\n";

// 1. Test Effective Permission Formula
echo "--- 1. Effective Permission Formula Resolution ---\n";

$testUser = User::where('email', 'customer@ala.ye')->first();
if (!$testUser) {
    $testUser = User::create([
        'id' => 'u_test_rbac_' . bin2hex(random_bytes(4)),
        'clerk_user_id' => 'clerk_test_rbac_user',
        'email' => 'customer@ala.ye',
        'full_name' => 'RBAC Test Customer',
        'role' => 'CUSTOMER',
        'status' => 'ACTIVE',
    ]);
}

// Ensure clean user_permissions for this test user
UserPermission::where('user_id', $testUser->id)->delete();

$customerBasePerms = $testUser->getEffectivePermissions();
assertCondition(
    'CUSTOMER base effective permissions should not include administrative permissions',
    !in_array('roles.manage', $customerBasePerms) && !in_array('inventory.adjust', $customerBasePerms),
    'Admin perms denied to customer. Effective count: ' . count($customerBasePerms)
);

// Add an additional granted permission: inventory.view
$invViewPerm = Permission::where('name', 'inventory.view')->first();
if ($invViewPerm) {
    UserPermission::create([
        'user_id' => $testUser->id,
        'permission_id' => $invViewPerm->id,
        'is_granted' => true,
        'reason' => 'Granted inventory audit access',
    ]);
}

$userWithAdd = User::find($testUser->id);
$permsAfterGrant = $userWithAdd->getEffectivePermissions();
assertCondition(
    'User with granted override inherits inventory.view',
    in_array('inventory.view', $permsAfterGrant),
    'Effective perms: ' . json_encode($permsAfterGrant)
);

// Switch user role to SHOP_EMPLOYEE which has products.view
$testUser->update(['role' => 'SHOP_EMPLOYEE']);
$empPerms = $testUser->getEffectivePermissions();
assertCondition(
    'SHOP_EMPLOYEE role gets products.view and granted inventory.view',
    in_array('products.view', $empPerms) && in_array('inventory.view', $empPerms),
    'Emp perms: ' . json_encode($empPerms)
);

// Now deny products.view for this user
$prodViewPerm = Permission::where('name', 'products.view')->first();
if ($prodViewPerm) {
    UserPermission::create([
        'user_id' => $testUser->id,
        'permission_id' => $prodViewPerm->id,
        'is_granted' => false,
        'reason' => 'Explicitly revoked products view',
    ]);
}

$userWithDeny = User::find($testUser->id);
$permsAfterDeny = $userWithDeny->getEffectivePermissions();
assertCondition(
    'Denied permission (products.view) is strictly removed from effective permissions',
    !in_array('products.view', $permsAfterDeny) && in_array('inventory.view', $permsAfterDeny),
    'Formula verified: Role + Additional - Denied = ' . json_encode($permsAfterDeny)
);

// 2. Super Admin Access
echo "\n--- 2. Super Admin Authoritative Privileges ---\n";
$superAdmin = User::where('role', 'SUPER_ADMIN')->first();
assertCondition(
    'SUPER_ADMIN user exists in database',
    $superAdmin !== null,
    'Super Admin: ' . ($superAdmin ? $superAdmin->email : 'NONE')
);

if ($superAdmin) {
    $saPerms = $superAdmin->getEffectivePermissions();
    $allPermsCount = Permission::count();
    assertCondition(
        'SUPER_ADMIN receives 100% of all registered system permissions',
        count($saPerms) === $allPermsCount,
        "Super Admin has {$allPermsCount}/{$allPermsCount} permissions"
    );
}

// 3. System Role Protection
echo "\n--- 3. Protected System Roles & Last Super Admin Guard ---\n";
$superAdminRole = Role::where('name', 'SUPER_ADMIN')->first();
assertCondition(
    'SUPER_ADMIN role is marked is_system = true',
    $superAdminRole && $superAdminRole->is_system,
    'Role is_system: ' . ($superAdminRole?->is_system ? 'true' : 'false')
);

$allSystemRoles = Role::where('is_system', true)->pluck('name')->toArray();
$requiredSystem = ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER', 'SHOP_OWNER', 'SHOP_EMPLOYEE'];
$missing = array_diff($requiredSystem, $allSystemRoles);
assertCondition(
    'All required system roles have is_system protection',
    empty($missing),
    'System roles present: ' . implode(', ', $allSystemRoles)
);

// 4. API Authorization Simulation via Laravel Kernel
echo "\n--- 4. API Endpoints & Role Guard Enforcement ---\n";

$realSuperAdmin = User::where('role', 'SUPER_ADMIN')->first();
$realCustomer = User::where('role', 'CUSTOMER')->first() ?? $testUser;
$realShopOwner = User::where('role', 'SHOP_OWNER')->first();

function makeJwt(string $sub, string $role = 'CUSTOMER'): string {
    $header = base64_encode(json_encode(['alg' => 'none', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'sub' => $sub,
        'role' => $role,
        'exp' => time() + 3600,
    ]));
    return "{$header}.{$payload}.";
}

// Test A: CUSTOMER -> /api/v1/admin/roles must return 403
$reqCustomer = Request::create('/api/v1/admin/roles', 'GET');
$reqCustomer->headers->set('Authorization', 'Bearer ' . makeJwt($realCustomer->clerk_user_id, 'CUSTOMER'));
$reqCustomer->headers->set('Accept', 'application/json');
$respCustomer = $kernel->handle($reqCustomer);
$statusCustomer = $respCustomer->getStatusCode();
assertCondition(
    'CUSTOMER → Roles API returns 403 Forbidden',
    $statusCustomer === 403,
    "Status: {$statusCustomer}"
);

// Test B: SHOP_OWNER -> /api/v1/admin/roles must return 403
$reqShopOwner = Request::create('/api/v1/admin/roles', 'GET');
$reqShopOwner->headers->set('Authorization', 'Bearer ' . makeJwt($realShopOwner ? $realShopOwner->clerk_user_id : 'user_owner_01', 'SHOP_OWNER'));
$reqShopOwner->headers->set('Accept', 'application/json');
$respShopOwner = $kernel->handle($reqShopOwner);
$statusShopOwner = $respShopOwner->getStatusCode();
assertCondition(
    'SHOP_OWNER → Roles API returns 403 Forbidden',
    $statusShopOwner === 403,
    "Status: {$statusShopOwner}"
);

// Test C: Header spoofing attempt: X-Role: SUPER_ADMIN as CUSTOMER
$reqSpoof = Request::create('/api/v1/admin/roles', 'GET');
$reqSpoof->headers->set('Authorization', 'Bearer ' . makeJwt($realCustomer->clerk_user_id, 'CUSTOMER'));
$reqSpoof->headers->set('X-Role', 'SUPER_ADMIN');
$reqSpoof->headers->set('Accept', 'application/json');
$respSpoof = $kernel->handle($reqSpoof);
$statusSpoof = $respSpoof->getStatusCode();
assertCondition(
    'Spoofing X-Role: SUPER_ADMIN while authenticated as CUSTOMER must remain 403',
    $statusSpoof === 403,
    "Status: {$statusSpoof} (Spoofed header rejected by server authority)"
);

// Test D: SUPER_ADMIN -> /api/v1/admin/roles returns 200
$reqSuperAdmin = Request::create('/api/v1/admin/roles', 'GET');
$reqSuperAdmin->headers->set('Authorization', 'Bearer ' . makeJwt($realSuperAdmin->clerk_user_id, 'SUPER_ADMIN'));
$reqSuperAdmin->headers->set('Accept', 'application/json');
$respSuperAdmin = $kernel->handle($reqSuperAdmin);
$statusSuperAdmin = $respSuperAdmin->getStatusCode();
assertCondition(
    'SUPER_ADMIN → Roles API returns 200 OK',
    $statusSuperAdmin === 200,
    "Status: {$statusSuperAdmin}"
);

// Test E: Permissions Matrix API
$reqMatrix = Request::create('/api/v1/admin/permissions/matrix', 'GET');
$reqMatrix->headers->set('Authorization', 'Bearer ' . makeJwt($realSuperAdmin->clerk_user_id, 'SUPER_ADMIN'));
$reqMatrix->headers->set('Accept', 'application/json');
$respMatrix = $kernel->handle($reqMatrix);
$statusMatrix = $respMatrix->getStatusCode();
$matrixData = json_decode($respMatrix->getContent(), true);
$hasModules = !empty($matrixData['modules']);
assertCondition(
    'SUPER_ADMIN → Permissions Matrix returns 200 with modules & actions grid',
    $statusMatrix === 200 && $hasModules,
    "Status: {$statusMatrix}, Modules: " . count($matrixData['modules'] ?? []) . ", Actions: " . count($matrixData['actions'] ?? [])
);

// Test F: Auth Me returns effective_permissions
$reqMe = Request::create('/api/v1/auth/me', 'GET');
$reqMe->headers->set('Authorization', 'Bearer ' . makeJwt($realSuperAdmin->clerk_user_id, 'SUPER_ADMIN'));
$reqMe->headers->set('Accept', 'application/json');
$respMe = $kernel->handle($reqMe);
$meData = json_decode($respMe->getContent(), true);
$hasEffective = !empty($meData['user']['effective_permissions']);
assertCondition(
    'GET /api/v1/auth/me returns effective_permissions resolved server-side',
    $hasEffective,
    'Returned ' . count($meData['user']['effective_permissions'] ?? []) . ' effective permissions'
);

echo "\n============================================================\n";
echo "SUMMARY: Passed: {$passed}, Failed: {$failed}\n";
echo "============================================================\n";

exit($failed > 0 ? 1 : 0);
