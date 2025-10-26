-- ============================================
-- QUICK FIX: Add example_products Column
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add the column
ALTER TABLE custom_services
ADD COLUMN IF NOT EXISTS example_products uuid[] DEFAULT '{}';

-- Step 2: Add documentation
COMMENT ON COLUMN custom_services.example_products 
IS 'Array of product IDs (UUIDs) from catalog_products to display as examples for this service';

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_custom_services_example_products 
ON custom_services USING GIN (example_products);

-- Step 4: Verify it worked
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'custom_services' 
  AND column_name = 'example_products';

-- Expected result:
-- column_name       | data_type | column_default
-- example_products  | ARRAY     | '{}'::uuid[]

-- If you see the above result, SUCCESS! ✅
-- Now go to Settings → API → Reload schema cache in Supabase Dashboard
