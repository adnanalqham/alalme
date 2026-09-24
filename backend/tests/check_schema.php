<?php
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = ['users', 'shops', 'products', 'orders', 'order_items', 'order_shop_groups', 'inventories', 'reviews', 'complaints', 'categories', 'audit_logs'];

$result = [];
foreach ($tables as $t) {
    if (Schema::hasTable($t)) {
        $cols = array_map(fn($c) => $c['name'] . ' (' . Schema::getColumnType($t, $c['name']) . ')', Schema::getColumns($t));
        $count = DB::table($t)->count();
        $result[$t] = ['count' => $count, 'columns' => $cols];
    } else {
        $result[$t] = 'NOT_FOUND';
    }
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
