-- ============================================================================
-- ALA Auto Parts — Vehicle Database & NHTSA vPIC Integration Schema
-- PostgreSQL DDL Migration
-- Version: 2.6.0
-- ============================================================================

-- 1. VEHICLE MAKES
CREATE TABLE IF NOT EXISTS vehicle_makes (
    id BIGSERIAL PRIMARY KEY,
    nhtsa_make_id INTEGER UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150),
    slug VARCHAR(180) NOT NULL UNIQUE,
    vehicle_type VARCHAR(100) DEFAULT 'Passenger Car',
    logo_url VARCHAR(500),
    country_id VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    source VARCHAR(50) NOT NULL DEFAULT 'nhtsa', -- 'nhtsa', 'manual', 'other'
    source_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_makes_name_en ON vehicle_makes(name_en);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_name_ar ON vehicle_makes(name_ar);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_slug ON vehicle_makes(slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_nhtsa_id ON vehicle_makes(nhtsa_make_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_makes_is_active ON vehicle_makes(is_active);

-- 2. VEHICLE MODELS
CREATE TABLE IF NOT EXISTS vehicle_models (
    id BIGSERIAL PRIMARY KEY,
    make_id BIGINT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    nhtsa_model_id INTEGER,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150),
    slug VARCHAR(180) NOT NULL,
    vehicle_type VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    source VARCHAR(50) NOT NULL DEFAULT 'nhtsa', -- 'nhtsa', 'manual', 'other'
    source_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_make_model_slug UNIQUE (make_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_models_make_id ON vehicle_models(make_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_name_en ON vehicle_models(name_en);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_name_ar ON vehicle_models(name_ar);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_nhtsa_id ON vehicle_models(nhtsa_model_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_is_active ON vehicle_models(is_active);

-- 3. VEHICLE MODEL YEARS
CREATE TABLE IF NOT EXISTS vehicle_model_years (
    id BIGSERIAL PRIMARY KEY,
    model_id BIGINT NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'nhtsa',
    source_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_model_year UNIQUE (model_id, year)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_model_years_model_id ON vehicle_model_years(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_model_years_year ON vehicle_model_years(year);

-- 4. VEHICLE SPECIFICATIONS (vPIC Technical Specs)
CREATE TABLE IF NOT EXISTS vehicle_specs (
    id BIGSERIAL PRIMARY KEY,
    model_id BIGINT NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    year_id BIGINT REFERENCES vehicle_model_years(id) ON DELETE SET NULL,
    make_id BIGINT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    model_name VARCHAR(150) NOT NULL,
    model_year INTEGER NOT NULL,
    trim VARCHAR(100),
    series VARCHAR(100),
    body_class VARCHAR(100),
    vehicle_type VARCHAR(100),
    doors INTEGER,
    engine_model VARCHAR(100),
    engine_cylinders INTEGER,
    engine_displacement_cc INTEGER,
    engine_hp NUMERIC(8, 2),
    fuel_type VARCHAR(80),
    drive_type VARCHAR(80),
    transmission_style VARCHAR(80),
    transmission_speeds VARCHAR(50),
    electrification_level VARCHAR(80),
    raw_data JSONB,
    source VARCHAR(50) NOT NULL DEFAULT 'nhtsa',
    source_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_specs_make_model_year ON vehicle_specs(make_id, model_id, model_year);
CREATE INDEX IF NOT EXISTS idx_vehicle_specs_fuel_type ON vehicle_specs(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_specs_body_class ON vehicle_specs(body_class);

-- 5. USER VEHICLES (My Garage)
CREATE TABLE IF NOT EXISTS user_vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    make_id BIGINT NOT NULL REFERENCES vehicle_makes(id) ON DELETE RESTRICT,
    model_id BIGINT NOT NULL REFERENCES vehicle_models(id) ON DELETE RESTRICT,
    year_id BIGINT REFERENCES vehicle_model_years(id) ON DELETE SET NULL,
    vehicle_spec_id BIGINT REFERENCES vehicle_specs(id) ON DELETE SET NULL,
    nickname VARCHAR(100),
    vin VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON user_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_is_default ON user_vehicles(user_id, is_default);

-- 6. VEHICLE ALIASES (Arabic & English Normalization & Dialects)
CREATE TABLE IF NOT EXISTS vehicle_aliases (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'make', 'model'
    entity_id BIGINT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'ar',
    alias VARCHAR(150) NOT NULL,
    normalized_alias VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_aliases_lookup ON vehicle_aliases(normalized_alias, language);
CREATE INDEX IF NOT EXISTS idx_vehicle_aliases_entity ON vehicle_aliases(entity_type, entity_id);

-- 7. PRODUCT VEHICLE COMPATIBILITY (ALA Catalog Fitments)
CREATE TABLE IF NOT EXISTS product_vehicle_compatibilities (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    make_id BIGINT NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    model_id BIGINT REFERENCES vehicle_models(id) ON DELETE CASCADE,
    year_from INTEGER NOT NULL,
    year_to INTEGER NOT NULL,
    engine_code VARCHAR(100),
    engine_name VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pvc_product_id ON product_vehicle_compatibilities(product_id);
CREATE INDEX IF NOT EXISTS idx_pvc_fitment ON product_vehicle_compatibilities(make_id, model_id, year_from, year_to);

-- 8. VEHICLE SYNC LOGS
CREATE TABLE IF NOT EXISTS vehicle_sync_logs (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'makes', 'models', 'years', 'specs', 'vin_decode'
    status VARCHAR(50) NOT NULL, -- 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL'
    records_processed INTEGER NOT NULL DEFAULT 0,
    records_created INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON vehicle_sync_logs(type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON vehicle_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON vehicle_sync_logs(started_at DESC);
