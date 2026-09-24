<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_makes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('nhtsa_make_id')->nullable()->unique();
            $table->string('name_en', 150)->index();
            $table->string('name_ar', 150)->nullable()->index();
            $table->string('slug', 180)->unique();
            $table->string('vehicle_type', 100)->default('Passenger Car');
            $table->string('logo_url', 500)->nullable();
            $table->string('country_id', 50)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->string('source', 50)->default('nhtsa');
            $table->timestamp('source_updated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('vehicle_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('make_id')->constrained('vehicle_makes')->cascadeOnDelete();
            $table->unsignedInteger('nhtsa_model_id')->nullable()->index();
            $table->string('name_en', 150)->index();
            $table->string('name_ar', 150)->nullable()->index();
            $table->string('slug', 180);
            $table->string('vehicle_type', 100)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->string('source', 50)->default('nhtsa');
            $table->timestamp('source_updated_at')->nullable();
            $table->timestamps();

            $table->unique(['make_id', 'slug']);
        });

        Schema::create('vehicle_model_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->unsignedSmallInteger('year')->index();
            $table->string('source', 50)->default('nhtsa');
            $table->timestamp('source_updated_at')->nullable();
            $table->timestamps();

            $table->unique(['model_id', 'year']);
        });

        Schema::create('vehicle_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('vehicle_models')->cascadeOnDelete();
            $table->foreignId('year_id')->nullable()->constrained('vehicle_model_years')->nullOnDelete();
            $table->foreignId('make_id')->constrained('vehicle_makes')->cascadeOnDelete();
            $table->string('model_name', 150);
            $table->unsignedSmallInteger('model_year')->index();
            $table->string('trim', 100)->nullable();
            $table->string('series', 100)->nullable();
            $table->string('body_class', 100)->nullable()->index();
            $table->string('vehicle_type', 100)->nullable();
            $table->unsignedTinyInteger('doors')->nullable();
            $table->string('engine_model', 100)->nullable();
            $table->unsignedTinyInteger('engine_cylinders')->nullable();
            $table->unsignedInteger('engine_displacement_cc')->nullable();
            $table->decimal('engine_hp', 8, 2)->nullable();
            $table->string('fuel_type', 80)->nullable()->index();
            $table->string('drive_type', 80)->nullable();
            $table->string('transmission_style', 80)->nullable();
            $table->string('transmission_speeds', 50)->nullable();
            $table->string('electrification_level', 80)->nullable();
            $table->json('raw_data')->nullable();
            $table->string('source', 50)->default('nhtsa');
            $table->timestamp('source_updated_at')->nullable();
            $table->timestamps();

            $table->index(['make_id', 'model_id', 'model_year']);
        });

        Schema::create('user_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('user_id', 100)->index();
            $table->foreignId('make_id')->constrained('vehicle_makes')->restrictOnDelete();
            $table->foreignId('model_id')->constrained('vehicle_models')->restrictOnDelete();
            $table->foreignId('year_id')->nullable()->constrained('vehicle_model_years')->nullOnDelete();
            $table->foreignId('vehicle_spec_id')->nullable()->constrained('vehicle_specs')->nullOnDelete();
            $table->string('nickname', 100)->nullable();
            $table->string('vin', 20)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });

        Schema::create('vehicle_aliases', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('entity_id');
            $table->string('language', 10)->default('ar');
            $table->string('alias', 150);
            $table->string('normalized_alias', 150)->index();
            $table->timestamps();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['normalized_alias', 'language']);
        });

        Schema::create('product_vehicle_compatibilities', function (Blueprint $table) {
            $table->id();
            $table->string('product_id', 100)->index();
            $table->foreignId('make_id')->constrained('vehicle_makes')->cascadeOnDelete();
            $table->foreignId('model_id')->nullable()->constrained('vehicle_models')->cascadeOnDelete();
            $table->unsignedSmallInteger('year_from');
            $table->unsignedSmallInteger('year_to');
            $table->string('engine_code', 100)->nullable();
            $table->string('engine_name', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['make_id', 'model_id', 'year_from', 'year_to'], 'idx_pvc_compatibility');
        });

        Schema::create('vehicle_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50)->index();
            $table->string('status', 50)->index();
            $table->unsignedInteger('records_processed')->default(0);
            $table->unsignedInteger('records_created')->default(0);
            $table->unsignedInteger('records_updated')->default(0);
            $table->unsignedInteger('records_failed')->default(0);
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index('started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_sync_logs');
        Schema::dropIfExists('product_vehicle_compatibilities');
        Schema::dropIfExists('vehicle_aliases');
        Schema::dropIfExists('user_vehicles');
        Schema::dropIfExists('vehicle_specs');
        Schema::dropIfExists('vehicle_model_years');
        Schema::dropIfExists('vehicle_models');
        Schema::dropIfExists('vehicle_makes');
    }
};
