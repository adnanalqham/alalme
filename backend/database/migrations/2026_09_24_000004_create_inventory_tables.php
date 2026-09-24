<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inventory: inventories (stock per product per branch), inventory_movements.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Inventory — stock levels per product per branch
        if (!Schema::hasTable('inventories')) {
            Schema::create('inventories', function (Blueprint $table) {
                $table->id();
                $table->string('product_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->string('branch_id', 64)->nullable()->index();
                $table->integer('quantity')->default(0);
                $table->integer('low_stock_threshold')->default(5);
                $table->boolean('track_quantity')->default(true);
                $table->boolean('allow_backorder')->default(false);
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->unique(['product_id', 'branch_id']);
                $table->index(['shop_id', 'quantity']);
            });
        }

        // Inventory Movements — audit trail
        if (!Schema::hasTable('inventory_movements')) {
            Schema::create('inventory_movements', function (Blueprint $table) {
                $table->id();
                $table->string('product_id', 64)->index();
                $table->string('shop_id', 64)->index();
                $table->string('branch_id', 64)->nullable()->index();
                $table->string('user_id', 64)->nullable()->index(); // Who made the change

                $table->string('type', 32);
                // PURCHASE, SALE, RETURN, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, DAMAGE, INITIAL

                $table->integer('quantity_before');
                $table->integer('quantity_change'); // + or -
                $table->integer('quantity_after');
                $table->string('reference_type', 64)->nullable(); // order, adjustment, etc.
                $table->string('reference_id', 64)->nullable(); // order ID, etc.
                $table->text('reason')->nullable();

                $table->timestamp('created_at')->useCurrent();

                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->index(['product_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventories');
    }
};
