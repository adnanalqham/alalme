<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Shops, shop_branches, shop_users (employees + owners).
 * shop_commissions.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Shops
        if (!Schema::hasTable('shops')) {
            Schema::create('shops', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('owner_id', 64)->index(); // FK to users
                $table->string('name_ar', 150);
                $table->string('name_en', 150);
                $table->string('slug', 180)->unique()->nullable();
                $table->text('description_ar')->nullable();
                $table->text('description_en')->nullable();

                // Contact
                $table->string('phone', 32)->nullable();
                $table->string('whatsapp', 32)->nullable();
                $table->string('email', 255)->nullable();
                $table->string('website', 500)->nullable();

                // Location
                $table->string('country_id', 16)->default('c_ye');
                $table->string('city_id', 32)->nullable();
                $table->string('city', 100)->nullable();
                $table->text('address')->nullable();

                // Media
                $table->string('logo_url', 500)->nullable();
                $table->string('banner_url', 500)->nullable();

                // Status & RBAC
                $table->string('status', 32)->default('PENDING');
                // PENDING, ACTIVE, SUSPENDED, REJECTED, CLOSED
                $table->string('rejection_reason', 500)->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->string('approved_by', 64)->nullable();

                // Business
                $table->string('commercial_reg_no', 50)->nullable();
                $table->decimal('rating', 3, 2)->default(0);
                $table->unsignedInteger('rating_count')->default(0);

                $table->timestamps();
                $table->softDeletes();

                $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('country_id')->references('id')->on('countries');
                $table->index('status', 'shops_status_idx');
            });
        }

        // Shop Branches
        if (!Schema::hasTable('shop_branches')) {
            Schema::create('shop_branches', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('shop_id', 64)->index();
                $table->string('name_ar', 150);
                $table->string('name_en', 150)->nullable();
                $table->string('phone', 32)->nullable();
                $table->string('country_id', 16)->nullable();
                $table->string('city_id', 32)->nullable();
                $table->string('city', 100)->nullable();
                $table->text('address')->nullable();
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->json('opening_hours')->nullable();
                $table->string('status', 32)->default('ACTIVE')->index();
                $table->boolean('is_main')->default(false);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            });
        }

        // Shop Users (employees, managers, owners)
        if (!Schema::hasTable('shop_users')) {
            Schema::create('shop_users', function (Blueprint $table) {
                $table->id();
                $table->string('shop_id', 64)->index();
                $table->string('user_id', 64)->index();
                $table->string('branch_id', 64)->nullable()->index();
                $table->string('role', 32)->default('EMPLOYEE'); // OWNER, MANAGER, EMPLOYEE
                $table->json('permissions')->nullable(); // Explicit permission overrides
                $table->string('status', 32)->default('ACTIVE')->index();
                // INVITED, ACTIVE, SUSPENDED, REMOVED
                $table->string('invited_by', 64)->nullable();
                $table->timestamp('invited_at')->nullable();
                $table->timestamp('joined_at')->nullable();
                $table->timestamps();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->unique(['shop_id', 'user_id']);
            });
        }

        // Shop Commissions
        if (!Schema::hasTable('shop_commissions')) {
            Schema::create('shop_commissions', function (Blueprint $table) {
                $table->id();
                $table->string('shop_id', 64)->index();
                $table->string('commission_type', 32)->default('PERCENTAGE'); // PERCENTAGE, FIXED
                $table->decimal('commission_value', 10, 4);
                $table->timestamp('effective_from')->nullable();
                $table->timestamp('effective_to')->nullable();
                $table->string('status', 32)->default('ACTIVE'); // ACTIVE, INACTIVE
                $table->string('created_by', 64)->nullable();
                $table->timestamps();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_commissions');
        Schema::dropIfExists('shop_users');
        Schema::dropIfExists('shop_branches');
        Schema::dropIfExists('shops');
    }
};
