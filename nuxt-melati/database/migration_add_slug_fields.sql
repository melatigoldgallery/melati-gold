-- Migration: Add slug fields to categories and subcategories
-- Date: February 1, 2026
-- Purpose: Enable URL-friendly routing for Strategy A

-- Add slug column to catalog_categories
ALTER TABLE catalog_categories 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs from existing category names
-- Convert to lowercase and replace non-alphanumeric with hyphens
UPDATE catalog_categories 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Add slug column to catalog_subcategories
ALTER TABLE catalog_subcategories 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from existing subcategory names
UPDATE catalog_subcategories 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON catalog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON catalog_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_products_id ON catalog_products(id);
CREATE INDEX IF NOT EXISTS idx_products_category ON catalog_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON catalog_products(subcategory_id);

-- Verify slugs are unique for categories
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT slug, COUNT(*) as cnt
    FROM catalog_categories
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Warning: Found % duplicate slugs in categories', duplicate_count;
  ELSE
    RAISE NOTICE 'Success: All category slugs are unique';
  END IF;
END $$;

-- Add comment to document the purpose
COMMENT ON COLUMN catalog_categories.slug IS 'URL-friendly slug for routing (e.g., cincin, gelang)';
COMMENT ON COLUMN catalog_subcategories.slug IS 'URL-friendly slug for filtering (e.g., cincin-tunangan, cincin-nikah)';
