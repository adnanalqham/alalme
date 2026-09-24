-- ============================================================================
-- ALA Auto Parts - Master Automotive Parts Taxonomy Database Schema
-- Migration: 2026_09_20_000001_create_part_taxonomy_tables.sql
-- Target Database: PostgreSQL 14+ (or MySQL / SQLite compatible)
-- ============================================================================

-- 1. Categories Table (Supports multi-level hierarchy: System -> Subcategory)
CREATE TABLE IF NOT EXISTS part_categories (
    id VARCHAR(64) PRIMARY KEY,
    parent_id VARCHAR(64) REFERENCES part_categories(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    icon VARCHAR(64) DEFAULT 'Package',
    image VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_part_categories_parent ON part_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_part_categories_slug ON part_categories(slug);
CREATE INDEX IF NOT EXISTS idx_part_categories_active ON part_categories(is_active);

-- 2. Part Types Table (Specific automotive component types linked to a subcategory)
CREATE TABLE IF NOT EXISTS part_types (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL REFERENCES part_categories(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description_ar TEXT,
    description_en TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_part_types_category ON part_types(category_id);
CREATE INDEX IF NOT EXISTS idx_part_types_slug ON part_types(slug);
CREATE INDEX IF NOT EXISTS idx_part_types_active ON part_types(is_active);

-- 3. Part Aliases Table (Colloquial, regional Yemeni, Gulf, and technical synonyms)
CREATE TABLE IF NOT EXISTS part_aliases (
    id VARCHAR(64) PRIMARY KEY,
    part_type_id VARCHAR(64) NOT NULL REFERENCES part_types(id) ON DELETE CASCADE,
    language VARCHAR(8) NOT NULL DEFAULT 'ar', -- 'ar' | 'en'
    alias VARCHAR(255) NOT NULL,
    normalized_alias VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_part_aliases_part_type ON part_aliases(part_type_id);
CREATE INDEX IF NOT EXISTS idx_part_aliases_normalized ON part_aliases(normalized_alias);
CREATE INDEX IF NOT EXISTS idx_part_aliases_lang ON part_aliases(language);

-- 4. Part Search Keywords Table (Tokenized search index for fast autocompletion)
CREATE TABLE IF NOT EXISTS part_search_keywords (
    id VARCHAR(64) PRIMARY KEY,
    part_type_id VARCHAR(64) NOT NULL REFERENCES part_types(id) ON DELETE CASCADE,
    keyword VARCHAR(128) NOT NULL,
    normalized_keyword VARCHAR(128) NOT NULL,
    language VARCHAR(8) NOT NULL DEFAULT 'ar',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_part_keywords_part_type ON part_search_keywords(part_type_id);
CREATE INDEX IF NOT EXISTS idx_part_keywords_norm ON part_search_keywords(normalized_keyword);

-- 5. Product Taxonomy Linkage (For products belonging to a standardized part type)
-- (Existing or future products table can add `part_type_id`)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS part_type_id VARCHAR(64) REFERENCES part_types(id) ON DELETE SET NULL;
