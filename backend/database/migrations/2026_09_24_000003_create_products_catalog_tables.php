<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Product catalog: categories, manufacturers, products, product_images, product_vehicle_compatibilities.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Categories (hierarchical)
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('parent_id')->nullable()->index();
                $table->string('name_ar', 150);
                $table->string('name_en', 150);
                $table->string('slug', 200)->unique();
                $table->string('icon_url', 500)->nullable();
                $table->string('image_url', 500)->nullable();
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            });
        }

        // Manufacturers
        if (!Schema::hasTable('manufacturers')) {
            Schema::create('manufacturers', function (Blueprint $table) {
                $table->id();
                $table->string('name_ar', 150);
                $table->string('name_en', 150);
                $table->string('slug', 200)->unique();
                $table->string('logo_url', 500)->nullable();
                $table->string('country_of_origin', 100)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Products
        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->string('id', 64)->primary();
                $table->string('shop_id', 64)->index();
                $table->unsignedBigInteger('category_id')->nullable()->index();
                $table->unsignedBigInteger('manufacturer_id')->nullable()->index();

                // Identifiers
                $table->string('name_ar', 200);
                $table->string('name_en', 200);
                $table->string('part_number', 100)->nullable()->index();
                $table->string('oem_number', 100)->nullable()->index();
                $table->string('barcode', 100)->nullable()->index();

                // Descriptions
                $table->text('description_ar')->nullable();
                $table->text('description_en')->nullable();

                // Product details
                $table->string('condition', 32)->default('NEW');
                // OEM, NEW, AFTERMARKET, USED, REFURBISHED
                $table->string('price_visibility', 32)->default('SHOW_PRICE');
                // SHOW_PRICE, HIDE_PRICE, CONTACT_ONLY
                $table->string('purchase_method', 32)->default('DIRECT');
                // DIRECT, REQUEST, WHATSAPP

                // Pricing (nullable if hidden)
                $table->decimal('price', 12, 4)->nullable();
                $table->string('currency_code', 8)->default('USD');

                // Status
                $table->string('status', 32)->default('ACTIVE')->index();
                // ACTIVE, INACTIVE, OUT_OF_STOCK, SUSPENDED_BY_ADMIN

                // Stats
                $table->decimal('rating', 3, 2)->default(0);
                $table->unsignedInteger('rating_count')->default(0);
                $table->unsignedInteger('view_count')->default(0);

                $table->timestamps();
                $table->softDeletes();

                $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
                $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
                $table->foreign('manufacturer_id')->references('id')->on('manufacturers')->onDelete('set null');

                $table->index(['shop_id', 'status']);
                $table->index(['part_number', 'oem_number']);
            });
        }

        // Product Images
        if (!Schema::hasTable('product_images')) {
            Schema::create('product_images', function (Blueprint $table) {
                $table->id();
                $table->string('product_id', 64)->index();
                $table->string('url', 500);
                $table->string('alt_ar', 200)->nullable();
                $table->string('alt_en', 200)->nullable();
                $table->boolean('is_primary')->default(false);
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            });
        }

        // Product → Vehicle Compatibility
        if (!Schema::hasTable('product_vehicle_compatibilities')) {
            Schema::create('product_vehicle_compatibilities', function (Blueprint $table) {
                $table->id();
                $table->string('product_id', 64)->index();
                $table->string('make', 100);
                $table->string('model', 100)->nullable();
                $table->unsignedSmallInteger('year_from')->nullable();
                $table->unsignedSmallInteger('year_to')->nullable();
                $table->string('engine', 100)->nullable();
                $table->string('trim', 100)->nullable();
                $table->string('notes', 200)->nullable();
                $table->timestamps();

                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->index(['make', 'model', 'year_from', 'year_to']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_vehicle_compatibilities');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('manufacturers');
        Schema::dropIfExists('categories');
    }
};
