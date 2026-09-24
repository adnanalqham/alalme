<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RBACSeeder::class,
            GeographySeeder::class,
            CategorySeeder::class,
            ManufacturerSeeder::class,
            VehicleDatabaseSeeder::class,
            MarketplaceDemoSeeder::class,
        ]);
    }
}
