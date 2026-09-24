<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates normalized automotive spare-parts taxonomy tables.
     */
    public function up(): void
    {
        // 1. Part Categories (Hierarchical: Systems & Subcategories)
        Schema::create('part_categories', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('parent_id', 64)->nullable()->index();
            $table->string('name_ar');
            $table->string('name_en');
            $table->string('slug', 128)->unique();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->string('icon', 64)->default('Package');
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('id')
                ->on('part_categories')
                ->onDelete('cascade');
        });

        // 2. Part Types (Leaf-level automotive components)
        Schema::create('part_types', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('category_id', 64)->index();
            $table->string('name_ar');
            $table->string('name_en');
            $table->string('slug', 128)->unique();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->foreign('category_id')
                ->references('id')
                ->on('part_categories')
                ->onDelete('cascade');
        });

        // 3. Part Aliases (Colloquial Arabic, regional Yemeni/Gulf, and English synonyms)
        Schema::create('part_aliases', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('part_type_id', 64)->index();
            $table->string('language', 8)->default('ar')->index();
            $table->string('alias');
            $table->string('normalized_alias')->index();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('part_type_id')
                ->references('id')
                ->on('part_types')
                ->onDelete('cascade');
        });

        // 4. Part Search Keywords (Tokenized index for fast smart search)
        Schema::create('part_search_keywords', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('part_type_id', 64)->index();
            $table->string('keyword');
            $table->string('normalized_keyword')->index();
            $table->string('language', 8)->default('ar');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('part_type_id')
                ->references('id')
                ->on('part_types')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('part_search_keywords');
        Schema::dropIfExists('part_aliases');
        Schema::dropIfExists('part_types');
        Schema::dropIfExists('part_categories');
    }
};
