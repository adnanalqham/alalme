<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "============================================================\n";
echo "ALA ADMIN CONTROL CENTER — END-TO-END HTTP AUTHORIZATION TEST\n";
echo "============================================================\n\n";

$passed = 0;
$failed = 0;

function assertCondition($name, $condition, $details = '') {
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo " [PASS] $name\n";
        if ($details) echo "        $details\n";
    } else {
        $failed++;
        echo " [FAIL] $name\n";
        if ($details) echo "        $details\n";
    }
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function generateTestJwt($sub, $email, $role) {
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64UrlEncode(json_encode([
        'sub' => $sub,
        'email' => $email,
        'role' => $role,
        'iss' => 'https://mutual-chamois-9547.clerk.accounts.dev',
        'iat' => time(),
        'exp' => time() + 3600,
    ]));
    $sig = base64UrlEncode('test_signature');
    return "{$header}.{$payload}.{$sig}";
}

// Generate test JWTs for roles
$superAdminJwt = generateTestJwt('user_clerk_admin_01', 'admin@ala-parts.com', 'SUPER_ADMIN');
$customerJwt   = generateTestJwt('user_clerk_customer_01', 'customer@ala-parts.com', 'CUSTOMER');
$shopOwnerJwt  = generateTestJwt('user_clerk_owner_01', 'adnan@najm-parts.com', 'SHOP_OWNER');

$baseUrl = 'http://127.0.0.1:8000/api/v1';

function makeRequest($url, $token = null, $extraHeaders = []) {
    $ch = curl_init($url);
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];
    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }
    foreach ($extraHeaders as $h) {
        $headers[] = $h;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['status' => $httpCode, 'body' => json_decode($response, true), 'raw' => $response];
}

// 1. Unauthenticated requests (no token) -> 401
echo "--- 1. Testing Unauthenticated Access (Must be 401) ---\n";

$resNoAuthDash = makeRequest("{$baseUrl}/admin/dashboard");
assertCondition(
    "GET /admin/dashboard without token returns 401",
    $resNoAuthDash['status'] === 401,
    "Status: {$resNoAuthDash['status']}, Error: " . ($resNoAuthDash['body']['error'] ?? 'none')
);

$resNoAuthRoles = makeRequest("{$baseUrl}/admin/roles");
assertCondition(
    "GET /admin/roles without token returns 401",
    $resNoAuthRoles['status'] === 401,
    "Status: {$resNoAuthRoles['status']}"
);

$resNoAuthPerms = makeRequest("{$baseUrl}/admin/permissions");
assertCondition(
    "GET /admin/permissions without token returns 401",
    $resNoAuthPerms['status'] === 401,
    "Status: {$resNoAuthPerms['status']}"
);

$resNoAuthReports = makeRequest("{$baseUrl}/admin/reports/summary");
assertCondition(
    "GET /admin/reports/summary without token returns 401",
    $resNoAuthReports['status'] === 401,
    "Status: {$resNoAuthReports['status']}"
);

// 2. Customer Access -> 403 Forbidden
echo "\n--- 2. Testing Customer Access (Must be 403) ---\n";

$resCustDash = makeRequest("{$baseUrl}/admin/dashboard", $customerJwt);
assertCondition(
    "CUSTOMER -> GET /admin/dashboard returns 403 Forbidden",
    $resCustDash['status'] === 403,
    "Status: {$resCustDash['status']}, Error: " . ($resCustDash['body']['error'] ?? 'none')
);

$resCustRoles = makeRequest("{$baseUrl}/admin/roles", $customerJwt);
assertCondition(
    "CUSTOMER -> GET /admin/roles returns 403 Forbidden",
    $resCustRoles['status'] === 403,
    "Status: {$resCustRoles['status']}"
);

$resCustReports = makeRequest("{$baseUrl}/admin/reports/summary", $customerJwt);
assertCondition(
    "CUSTOMER -> GET /admin/reports/summary returns 403 Forbidden",
    $resCustReports['status'] === 403,
    "Status: {$resCustReports['status']}"
);

// 3. Shop Owner Access -> 403 Forbidden
echo "\n--- 3. Testing Shop Owner Access (Must be 403) ---\n";

$resOwnerDash = makeRequest("{$baseUrl}/admin/dashboard", $shopOwnerJwt);
assertCondition(
    "SHOP_OWNER -> GET /admin/dashboard returns 403 Forbidden",
    $resOwnerDash['status'] === 403,
    "Status: {$resOwnerDash['status']}"
);

$resOwnerRoles = makeRequest("{$baseUrl}/admin/roles", $shopOwnerJwt);
assertCondition(
    "SHOP_OWNER -> GET /admin/roles returns 403 Forbidden",
    $resOwnerRoles['status'] === 403,
    "Status: {$resOwnerRoles['status']}"
);

// 4. Header Spoofing Attack -> Must remain 403
echo "\n--- 4. Testing Header Spoofing Resistance ---\n";

$resSpoof = makeRequest("{$baseUrl}/admin/roles", $customerJwt, ['X-Role: SUPER_ADMIN', 'X-User-Role: SUPER_ADMIN']);
assertCondition(
    "Spoofed X-Role: SUPER_ADMIN with Customer token is rejected (403)",
    $resSpoof['status'] === 403,
    "Status: {$resSpoof['status']} (Server authority preserved)"
);

// 5. SUPER_ADMIN Access -> 200 OK with PostgreSQL data
echo "\n--- 5. Testing SUPER_ADMIN Access (Must be 200 OK) ---\n";

$resAdminDash = makeRequest("{$baseUrl}/admin/dashboard", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/dashboard returns 200 OK",
    $resAdminDash['status'] === 200,
    "Status: {$resAdminDash['status']}, Users: " . ($resAdminDash['body']['users']['total'] ?? 'N/A') .
    ", Orders: " . ($resAdminDash['body']['orders']['total'] ?? 'N/A') .
    ", Sales: " . ($resAdminDash['body']['sales']['total_sales'] ?? 'N/A') . " SAR"
);

$resAdminRoles = makeRequest("{$baseUrl}/admin/roles", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/roles returns 200 OK",
    $resAdminRoles['status'] === 200 && !empty($resAdminRoles['body']['roles']),
    "Status: {$resAdminRoles['status']}, Roles Count: " . count($resAdminRoles['body']['roles'] ?? [])
);

$resAdminPerms = makeRequest("{$baseUrl}/admin/permissions", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/permissions returns 200 OK",
    $resAdminPerms['status'] === 200 && !empty($resAdminPerms['body']['permissions']),
    "Status: {$resAdminPerms['status']}, Permissions Count: " . count($resAdminPerms['body']['permissions'] ?? [])
);

$resAdminReports = makeRequest("{$baseUrl}/admin/reports/summary", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/reports/summary returns 200 OK",
    $resAdminReports['status'] === 200 && isset($resAdminReports['body']['kpis']),
    "Status: {$resAdminReports['status']}, Revenue KPI: " . ($resAdminReports['body']['kpis']['revenue'] ?? 'N/A') . " SAR"
);

$resAdminMatrix = makeRequest("{$baseUrl}/admin/permissions/matrix", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/permissions/matrix returns 200 OK",
    $resAdminMatrix['status'] === 200 && !empty($resAdminMatrix['body']['modules']),
    "Status: {$resAdminMatrix['status']}, Modules: " . count($resAdminMatrix['body']['modules'] ?? [])
);

$resRolePerms = makeRequest("{$baseUrl}/admin/roles/1/permissions", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/roles/1/permissions returns 200 OK",
    $resRolePerms['status'] === 200 && !empty($resRolePerms['body']['permissions']),
    "Status: {$resRolePerms['status']}, Role Perms: " . count($resRolePerms['body']['permissions'] ?? [])
);

$resAdminUsers = makeRequest("{$baseUrl}/admin/users", $superAdminJwt);
assertCondition(
    "SUPER_ADMIN -> GET /admin/users returns 200 OK",
    $resAdminUsers['status'] === 200 && isset($resAdminUsers['body']['data']),
    "Status: {$resAdminUsers['status']}, Users in response: " . count($resAdminUsers['body']['data'] ?? [])
);

echo "\n============================================================\n";
echo "SUMMARY: Passed: $passed, Failed: $failed\n";
echo "============================================================\n";

if ($failed > 0) {
    exit(1);
}
