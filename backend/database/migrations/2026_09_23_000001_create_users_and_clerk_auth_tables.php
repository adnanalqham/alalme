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
        // 1. ALA Users Table linked to Clerk Identity
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('clerk_user_id', 128)->unique();
                $table->string('email', 255)->nullable()->index();
                $table->string('phone', 32)->nullable()->index();
                $table->string('full_name', 150);
                $table->string('avatar_url', 500)->nullable();
                
                // RBAC & Account State
                $table->string('role', 32)->default('CUSTOMER')->index(); // CUSTOMER, SHOP_OWNER, SHOP_EMPLOYEE, ADMIN, SUPER_ADMIN
                $table->string('status', 32)->default('ACTIVE')->index(); // ACTIVE, PENDING, SUSPENDED, REJECTED
                
                // Business Relationships
                $table->string('shop_id', 64)->nullable()->index();
                $table->string('branch_id', 64)->nullable();
                $table->json('permissions')->nullable(); // Explicit employee permission overrides
                
                // Geographical & Profile Metadata
                $table->string('country_id', 16)->default('c_ye');
                $table->string('city_id', 32)->nullable();
                $table->string('city', 100)->nullable();
                $table->text('address')->nullable();
                
                $table->timestamps();
            });
        }

        // 2. Shop Memberships Table (Multi-branch / Multi-employee support)
        if (!Schema::hasTable('shop_memberships')) {
            Schema::create('shop_memberships', function (Blueprint $table) {
                $table->id();
                $table->string('user_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->string('branch_id', 64)->nullable();
                $table->string('role', 32)->default('EMPLOYEE'); // OWNER, MANAGER, EMPLOYEE
                $table->json('permissions')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->unique(['user_id', 'shop_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_memberships');
        Schema::dropIfExists('users');
    }
};
