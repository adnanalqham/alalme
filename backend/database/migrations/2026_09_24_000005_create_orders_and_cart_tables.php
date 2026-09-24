<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Orders, order_items, order_shop_groups, order_status_history.
 * Cart and cart_items.
 * Delivery addresses and shipments.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Customer delivery addresses
        if (!Schema::hasTable('delivery_addresses')) {
            Schema::create('delivery_addresses', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('user_id', 64)->index();
                $table->string('label', 100)->nullable(); // Home, Work, etc.
                $table->string('recipient_name', 150)->nullable();
                $table->string('phone', 32)->nullable();
                $table->string('country_id', 16)->nullable();
                $table->string('city_id', 32)->nullable();
                $table->string('city', 100)->nullable();
                $table->text('address');
                $table->decimal('latitude', 10, 7)->nullable();
                $table->decimal('longitude', 10, 7)->nullable();
                $table->boolean('is_default')->default(false);
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Orders (master order)
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('customer_id', 64)->index();
                $table->string('order_number', 32)->unique(); // ORD-20260924-0001

                // Totals (calculated server-side)
                $table->decimal('subtotal', 14, 4)->default(0);
                $table->decimal('delivery_fee', 14, 4)->default(0);
                $table->decimal('discount', 14, 4)->default(0);
                $table->decimal('tax', 14, 4)->default(0);
                $table->decimal('total', 14, 4)->default(0);
                $table->string('currency_code', 8)->default('USD');

                // Status
                $table->string('status', 32)->default('PENDING')->index();
                // PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, COMPLETED, CANCELLED, REFUNDED

                // Delivery
                $table->string('delivery_type', 32)->default('PICKUP');
                // PICKUP, SHOP_DELIVERY, DELIVERY_COMPANY
                $table->string('delivery_address_id', 64)->nullable();
                $table->text('delivery_notes')->nullable();

                // Payment
                $table->string('payment_method', 32)->default('COD');
                // COD, BANK_TRANSFER, E_WALLET, CARD
                $table->string('payment_status', 32)->default('PENDING')->index();
                // PENDING, AUTHORIZED, PAID, FAILED, REFUNDED

                // Coupon
                $table->string('coupon_code', 50)->nullable();

                $table->timestamps();
                $table->softDeletes();

                $table->foreign('customer_id')->references('id')->on('users')->onDelete('restrict');
                $table->index(['customer_id', 'status']);
                $table->index('created_at');
            });
        }

        // Order Shop Groups (one per shop in a multi-shop order)
        if (!Schema::hasTable('order_shop_groups')) {
            Schema::create('order_shop_groups', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('order_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->string('branch_id', 64)->nullable();

                $table->decimal('subtotal', 14, 4)->default(0);
                $table->decimal('delivery_fee', 14, 4)->default(0);
                $table->decimal('total', 14, 4)->default(0);

                $table->string('status', 32)->default('PENDING')->index();
                $table->string('delivery_type', 32)->nullable();

                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('restrict');
            });
        }

        // Order Items
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->id();
                $table->string('order_id', 64)->index();
                $table->string('order_shop_group_id', 64)->nullable()->index();
                $table->string('product_id', 64)->nullable()->index();
                $table->string('shop_id', 64)->index();

                // Snapshot at time of order
                $table->string('product_name_ar', 200);
                $table->string('product_name_en', 200)->nullable();
                $table->string('part_number', 100)->nullable();
                $table->string('oem_number', 100)->nullable();

                $table->integer('quantity');
                $table->decimal('unit_price', 12, 4);
                $table->decimal('total_price', 14, 4);
                $table->string('currency_code', 8)->default('USD');

                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('set null');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('restrict');
            });
        }

        // Order Status History (audit trail)
        if (!Schema::hasTable('order_status_history')) {
            Schema::create('order_status_history', function (Blueprint $table) {
                $table->id();
                $table->string('order_id', 64)->index();
                $table->string('order_shop_group_id', 64)->nullable()->index();
                $table->string('status', 32);
                $table->string('changed_by', 64)->nullable(); // user_id
                $table->text('notes')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
                $table->index(['order_id', 'created_at']);
            });
        }

        // Cart
        if (!Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('user_id', 64)->nullable()->unique();
                $table->string('session_id', 128)->nullable()->unique(); // For guest carts
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }

        // Cart Items
        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->id();
                $table->string('cart_id', 64)->index();
                $table->string('product_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->integer('quantity')->default(1);
                $table->timestamps();

                $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->unique(['cart_id', 'product_id']);
            });
        }

        // Shipments
        if (!Schema::hasTable('shipments')) {
            Schema::create('shipments', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('order_id', 64)->index();
                $table->string('order_shop_group_id', 64)->nullable();
                $table->string('tracking_number', 100)->nullable();
                $table->string('carrier', 100)->nullable();
                $table->string('status', 32)->default('PENDING');
                $table->timestamp('shipped_at')->nullable();
                $table->timestamp('delivered_at')->nullable();
                $table->timestamps();

                $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('order_shop_groups');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('delivery_addresses');
    }
};
