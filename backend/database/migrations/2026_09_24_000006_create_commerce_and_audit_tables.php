<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payments, payment_transactions, reviews, complaints, notifications,
 * wishlists, coupons, banners, audit_logs.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Payments
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('order_id', 64)->index();
                $table->string('customer_id', 64)->index();
                $table->string('method', 32); // COD, BANK_TRANSFER, E_WALLET, CARD
                $table->decimal('amount', 14, 4);
                $table->string('currency_code', 8)->default('USD');
                $table->string('status', 32)->default('PENDING')->index();
                // PENDING, AUTHORIZED, PAID, FAILED, REFUNDED
                $table->string('provider_reference', 200)->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('restrict');
                $table->foreign('customer_id')->references('id')->on('users')->onDelete('restrict');
            });
        }

        // Payment Transactions (each payment attempt)
        if (!Schema::hasTable('payment_transactions')) {
            Schema::create('payment_transactions', function (Blueprint $table) {
                $table->id();
                $table->string('payment_id', 64)->index();
                $table->string('type', 32); // CHARGE, REFUND, CAPTURE, VOID
                $table->decimal('amount', 14, 4);
                $table->string('status', 32); // PENDING, SUCCESS, FAILED
                $table->string('provider_reference', 200)->nullable();
                $table->json('response_data')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            });
        }

        // Reviews
        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('user_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->string('product_id', 64)->nullable()->index();
                $table->string('order_id', 64)->nullable()->index();
                $table->unsignedTinyInteger('rating');
                $table->text('comment')->nullable();
                $table->string('status', 32)->default('PENDING')->index();
                // PENDING, APPROVED, REJECTED, HIDDEN
                $table->string('moderated_by', 64)->nullable();
                $table->text('moderation_note')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->unique(['user_id', 'order_id', 'shop_id']); // One review per order per shop
            });
        }

        // Complaints
        if (!Schema::hasTable('complaints')) {
            Schema::create('complaints', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('user_id', 64)->index();
                $table->string('shop_id', 64)->nullable()->index();
                $table->string('order_id', 64)->nullable()->index();
                $table->string('subject', 200);
                $table->text('description');
                $table->string('status', 32)->default('OPEN')->index();
                // OPEN, IN_REVIEW, WAITING, RESOLVED, CLOSED
                $table->string('assigned_to', 64)->nullable();
                $table->text('resolution_notes')->nullable();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Notifications
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('user_id', 64)->index();
                $table->string('type', 100); // shop_approved, order_confirmed, etc.
                $table->string('title_ar', 200);
                $table->string('title_en', 200)->nullable();
                $table->text('body_ar')->nullable();
                $table->text('body_en')->nullable();
                $table->json('data')->nullable(); // Extra payload (order_id, shop_id, etc.)
                $table->boolean('is_read')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index(['user_id', 'is_read']);
            });
        }

        // Wishlists
        if (!Schema::hasTable('wishlists')) {
            Schema::create('wishlists', function (Blueprint $table) {
                $table->id();
                $table->string('user_id', 64)->index();
                $table->string('product_id', 64)->index();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->unique(['user_id', 'product_id']);
            });
        }

        // Coupons
        if (!Schema::hasTable('coupons')) {
            Schema::create('coupons', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->string('type', 32)->default('PERCENTAGE'); // PERCENTAGE, FIXED
                $table->decimal('value', 10, 4);
                $table->decimal('minimum_order', 10, 4)->nullable();
                $table->decimal('maximum_discount', 10, 4)->nullable();
                $table->string('shop_id', 64)->nullable()->index(); // null = platform-wide
                $table->unsignedInteger('max_uses')->nullable();
                $table->unsignedInteger('used_count')->default(0);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Banners
        if (!Schema::hasTable('banners')) {
            Schema::create('banners', function (Blueprint $table) {
                $table->id();
                $table->string('title_ar', 200);
                $table->string('title_en', 200)->nullable();
                $table->string('image_url', 500);
                $table->string('link_url', 500)->nullable();
                $table->string('placement', 50)->default('HOME'); // HOME, SEARCH, CATEGORY
                $table->string('target', 32)->default('ALL'); // ALL, CUSTOMER, SHOP_OWNER
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // Audit Logs (immutable)
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('user_id', 64)->nullable()->index(); // Who did it
                $table->string('action', 100); // SHOP_APPROVED, USER_SUSPENDED, etc.
                $table->string('entity_type', 100)->nullable(); // shop, user, order, etc.
                $table->string('entity_id', 64)->nullable()->index();
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('user_agent', 500)->nullable();
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['entity_type', 'entity_id']);
                $table->index('action');
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payments');
    }
};
