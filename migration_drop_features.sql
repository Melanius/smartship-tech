-- Migration Script: Drop features column from technologies table
-- Created: 2025-10-04
-- Purpose: Remove features column from technologies table

-- Drop the features column if it exists
ALTER TABLE technologies DROP COLUMN IF EXISTS features;

-- Verification query (uncomment to check if column was dropped)
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'technologies';
