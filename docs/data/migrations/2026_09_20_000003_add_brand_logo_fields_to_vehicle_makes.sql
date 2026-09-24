-- ============================================================================
-- Migration: 2026_09_20_000003_add_brand_logo_fields_to_vehicle_makes.sql
-- Description: Add logo_source, logo_license, and logo_status to vehicle_makes
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicle_makes' AND column_name = 'logo_source'
    ) THEN
        ALTER TABLE vehicle_makes 
        ADD COLUMN logo_source VARCHAR(50) DEFAULT 'auto',
        ADD COLUMN logo_license VARCHAR(255) DEFAULT 'Public Brand Trademark / Cardog / Wikimedia Commons',
        ADD COLUMN logo_status VARCHAR(30) DEFAULT 'available';

        CREATE INDEX IF NOT EXISTS idx_vehicle_makes_logo_status ON vehicle_makes(logo_status);
        CREATE INDEX IF NOT EXISTS idx_vehicle_makes_logo_source ON vehicle_makes(logo_source);
    END IF;
END $$;
