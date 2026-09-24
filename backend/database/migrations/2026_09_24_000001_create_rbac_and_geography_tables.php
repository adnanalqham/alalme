<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Core RBAC tables: roles, permissions, role_permissions, user_permissions.
 * Countries and cities reference tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Countries
        if (!Schema::hasTable('countries')) {
            Schema::create('countries', function (Blueprint $table) {
                $table->string('id', 16)->primary(); // c_ye, c_sa, c_ae
                $table->string('name_ar', 100);
                $table->string('name_en', 100);
                $table->string('code', 4)->unique(); // YE, SA, AE
                $table->string('phone_code', 10)->nullable(); // +967
                $table->string('currency_code', 8)->default('USD');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Cities
        if (!Schema::hasTable('cities')) {
            Schema::create('cities', function (Blueprint $table) {
                $table->string('id', 32)->primary();
                $table->string('country_id', 16);
                $table->string('name_ar', 100);
                $table->string('name_en', 100);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('country_id')->references('id')->on('countries')->onDelete('cascade');
                $table->index('country_id');
            });
        }

        // Roles
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->unique(); // CUSTOMER, SHOP_OWNER, SHOP_EMPLOYEE, ADMIN, SUPER_ADMIN
                $table->string('label_ar', 100)->nullable();
                $table->string('label_en', 100)->nullable();
                $table->boolean('is_system')->default(true); // Cannot be deleted
                $table->timestamps();
            });
        }

        // Permissions
        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique(); // PRODUCTS_CREATE
                $table->string('label_ar', 150)->nullable();
                $table->string('label_en', 150)->nullable();
                $table->string('group', 50)->default('general'); // products, orders, etc.
                $table->timestamps();
            });
        }

        // Role → Permission pivot
        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table) {
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('permission_id');
                $table->primary(['role_id', 'permission_id']);
                $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
                $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
            });
        }

        // User → Permission overrides (for employees)
        if (!Schema::hasTable('user_permissions')) {
            Schema::create('user_permissions', function (Blueprint $table) {
                $table->id();
                $table->string('user_id', 64);
                $table->unsignedBigInteger('permission_id');
                $table->boolean('is_granted')->default(true); // true=grant, false=deny
                $table->string('shop_id', 64)->nullable(); // Scope to specific shop
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
                $table->unique(['user_id', 'permission_id', 'shop_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_permissions');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('countries');
    }
};
