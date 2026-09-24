<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Upgrade roles table
        Schema::table('roles', function (Blueprint $table) {
            if (!Schema::hasColumn('roles', 'display_name')) {
                $table->string('display_name', 150)->nullable()->after('name');
            }
            if (!Schema::hasColumn('roles', 'description')) {
                $table->text('description')->nullable()->after('display_name');
            }
            if (!Schema::hasColumn('roles', 'status')) {
                $table->string('status', 32)->default('ACTIVE')->after('is_system');
            }
        });

        // 2. Upgrade permissions table
        Schema::table('permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('permissions', 'display_name')) {
                $table->string('display_name', 150)->nullable()->after('name');
            }
            if (!Schema::hasColumn('permissions', 'description')) {
                $table->text('description')->nullable()->after('display_name');
            }
            if (!Schema::hasColumn('permissions', 'module')) {
                $table->string('module', 50)->default('general')->index()->after('description');
            }
            if (!Schema::hasColumn('permissions', 'action')) {
                $table->string('action', 50)->default('manage')->index()->after('module');
            }
            if (!Schema::hasColumn('permissions', 'scope')) {
                $table->string('scope', 32)->default('PLATFORM')->after('action');
                // PLATFORM, SHOP, BRANCH, OWN, ASSIGNED
            }
            if (!Schema::hasColumn('permissions', 'is_system')) {
                $table->boolean('is_system')->default(true)->after('scope');
            }
        });

        // 3. Upgrade user_permissions table for detailed overrides
        Schema::table('user_permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('user_permissions', 'created_by')) {
                $table->string('created_by', 64)->nullable()->after('shop_id');
            }
            if (!Schema::hasColumn('user_permissions', 'reason')) {
                $table->text('reason')->nullable()->after('created_by');
            }
        });

        // 4. Create settings table for platform configurations
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key', 100)->unique();
                $table->json('value')->nullable();
                $table->string('group', 50)->default('general')->index();
                // general, localization, marketplace, orders, payments, delivery, notifications, commission, security
                $table->boolean('is_public')->default(false);
                $table->string('updated_by', 64)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');

        Schema::table('user_permissions', function (Blueprint $table) {
            $table->dropColumn(['created_by', 'reason']);
        });

        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'description', 'module', 'action', 'scope', 'is_system']);
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['display_name', 'description', 'status']);
        });
    }
};
