-- ============================================
-- MIGRATION: Add UI Fields to catalog_products
-- Date: 2025-11-28
-- Purpose: Fix 406 error - add missing fields from form
-- ============================================

-- Add new columns for UI fields
ALTER TABLE catalog_products 
ADD COLUMN IF NOT EXISTS weight_grams decimal(10,2),
ADD COLUMN IF NOT EXISTS price_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_shopee_link text,
ADD COLUMN IF NOT EXISTS custom_whatsapp_number varchar(20);

-- Backfill weight_grams from existing weight strings
UPDATE catalog_products 
SET weight_grams = CAST(regexp_replace(weight, '[^0-9.]', '', 'g') AS decimal)
WHERE weight IS NOT NULL AND weight_grams IS NULL;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_catalog_products_weight_grams 
ON catalog_products(weight_grams) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_catalog_products_price_override 
ON catalog_products(price_override) 
WHERE is_active = true;

-- Add comments for documentation
COMMENT ON COLUMN catalog_products.weight_grams IS 'Numeric weight in grams for calculations and sorting';
COMMENT ON COLUMN catalog_products.price_override IS 'Flag indicating if price is manually set (not auto-calculated)';
COMMENT ON COLUMN catalog_products.custom_shopee_link IS 'Optional custom Shopee product link';
COMMENT ON COLUMN catalog_products.custom_whatsapp_number IS 'Optional custom WhatsApp number for this product';

-- Verify migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'catalog_products' 
AND column_name IN ('weight_grams', 'price_override', 'custom_shopee_link', 'custom_whatsapp_number');
