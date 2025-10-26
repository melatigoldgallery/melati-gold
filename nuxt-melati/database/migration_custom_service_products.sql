-- Migration: Add example_products to custom_services
-- Menambahkan kolom untuk menyimpan array UUID produk contoh yang relevan dengan service

-- 1. Add example_products column (array of UUIDs)
ALTER TABLE custom_services
ADD COLUMN IF NOT EXISTS example_products uuid[] DEFAULT '{}';

-- 2. Add comment for documentation
COMMENT ON COLUMN custom_services.example_products IS 'Array of product IDs (UUIDs) from catalog_products to display as examples for this service';

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_services_example_products 
ON custom_services USING GIN (example_products);

-- 4. Add constraint to ensure referenced products exist
-- Note: PostgreSQL doesn't support array foreign keys directly
-- We'll validate this in application code instead

-- 5. Example: Update existing services with sample products
-- Uncomment and modify based on your actual product IDs after running migration

-- UPDATE custom_services 
-- SET example_products = ARRAY[
--   (SELECT id FROM catalog_products WHERE title ILIKE '%cincin%' LIMIT 1),
--   (SELECT id FROM catalog_products WHERE title ILIKE '%gelang%' LIMIT 1)
-- ]::uuid[]
-- WHERE title = 'Desain Custom';

-- UPDATE custom_services 
-- SET example_products = ARRAY[
--   (SELECT id FROM catalog_products WHERE is_featured = true LIMIT 1)
-- ]::uuid[]
-- WHERE title = 'Konsultasi Gratis';

-- 6. Verification query
-- SELECT 
--   id,
--   title,
--   example_products,
--   array_length(example_products, 1) as product_count
-- FROM custom_services
-- ORDER BY display_order;

-- 7. Query to get service with products (for testing)
-- SELECT 
--   cs.id,
--   cs.title,
--   cs.description,
--   cs.example_products,
--   (
--     SELECT json_agg(
--       json_build_object(
--         'id', cp.id,
--         'title', cp.title,
--         'thumbnail_image', cp.thumbnail_image,
--         'price', cp.price
--       )
--     )
--     FROM catalog_products cp
--     WHERE cp.id = ANY(cs.example_products)
--     AND cp.is_active = true
--   ) as products
-- FROM custom_services cs
-- WHERE cs.is_active = true
-- ORDER BY cs.display_order;
