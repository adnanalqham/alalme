<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vehicle_makes', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicle_makes', 'logo_source')) {
                $table->string('logo_source', 50)->default('auto')->after('logo_url')->index();
            }
            if (!Schema::hasColumn('vehicle_makes', 'logo_license')) {
                $table->string('logo_license', 255)->nullable()->default('Public Brand Trademark / Cardog / Wikimedia Commons')->after('logo_source');
            }
            if (!Schema::hasColumn('vehicle_makes', 'logo_status')) {
                $table->string('logo_status', 30)->default('available')->after('logo_license')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_makes', function (Blueprint $table) {
            $table->dropColumn(['logo_source', 'logo_license', 'logo_status']);
        });
    }
};
