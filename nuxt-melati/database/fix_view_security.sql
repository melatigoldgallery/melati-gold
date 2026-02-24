-- ============================================
-- FIX VIEW SECURITY - Change to SECURITY INVOKER
-- Fixes Supabase Advisor warning: "View defined with SECURITY DEFINER"
-- ============================================

-- Drop and recreate views with SECURITY INVOKER
-- This ensures views respect RLS policies of the querying user

-- ============================================
-- 1. v_best_sellers
-- ============================================

DROP VIEW IF EXISTS v_best_sellers CASCADE;

CREATE OR REPLACE VIEW v_best_sellers
WITH (security_invoker = true)  -- Use querying user's permissions
AS
SELECT 
    p.id,
    p.title,
    p.name,
    p.description,
    p.thumbnail_image,
    p.images,
    p.price,
    p.price_display,
    p.karat,
    p.weight,
    p.weight_grams,
    p.specs,
    p.stock_status,
    p.is_featured,
    p.is_best_seller,
    p.is_active,
    p.display_order,
    p.category_id,
    p.subcategory_id,
    p.video_url,
    p.custom_shopee_link,
    p.custom_whatsapp_number,
    c.name as category_name,
    c.slug as category_slug,
    s.name as subcategory_name,
    s.slug as subcategory_slug
FROM catalog_products p
LEFT JOIN catalog_categories c ON p.category_id = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_best_seller = true 
AND p.is_active = true
ORDER BY p.display_order ASC;

-- Grant read access to anon and authenticated
GRANT SELECT ON v_best_sellers TO anon, authenticated;

-- ============================================
-- 2. v_featured_products
-- ============================================

DROP VIEW IF EXISTS v_featured_products CASCADE;

CREATE OR REPLACE VIEW v_featured_products
WITH (security_invoker = true)  -- Use querying user's permissions
AS
SELECT 
    p.id,
    p.title,
    p.name,
    p.description,
    p.thumbnail_image,
    p.images,
    p.price,
    p.price_display,
    p.karat,
    p.weight,
    p.weight_grams,
    p.specs,
    p.stock_status,
    p.is_featured,
    p.is_best_seller,
    p.is_active,
    p.display_order,
    p.category_id,
    p.subcategory_id,
    p.video_url,
    p.custom_shopee_link,
    p.custom_whatsapp_number,
    c.name as category_name,
    c.slug as category_slug,
    s.name as subcategory_name,
    s.slug as subcategory_slug
FROM catalog_products p
LEFT JOIN catalog_categories c ON p.category_id = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_featured = true 
AND p.is_active = true
ORDER BY p.display_order ASC;

-- Grant read access to anon and authenticated
GRANT SELECT ON v_featured_products TO anon, authenticated;

-- ============================================
-- 3. vw_products_with_calculated_price
-- ============================================

DROP VIEW IF EXISTS vw_products_with_calculated_price CASCADE;

CREATE OR REPLACE VIEW vw_products_with_calculated_price
WITH (security_invoker = true)  -- Use querying user's permissions
AS
SELECT 
    p.id,
    p.title,
    p.name,
    p.description,
    p.thumbnail_image,
    p.images,
    p.price,
    p.price_display,
    p.price_override,
    p.karat,
    p.weight,
    p.weight_grams,
    p.specs,
    p.stock_status,
    p.is_featured,
    p.is_best_seller,
    p.is_active,
    p.display_order,
    p.category_id,
    p.subcategory_id,
    p.video_url,
    p.custom_shopee_link,
    p.custom_whatsapp_number,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    s.name as subcategory_name,
    s.slug as subcategory_slug,
    -- Use existing price field (calculated price logic removed - karat_config table doesn't exist)
    p.price as calculated_price
FROM catalog_products p
LEFT JOIN catalog_categories c ON p.category_id = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_active = true;

-- Grant read access to anon and authenticated
GRANT SELECT ON vw_products_with_calculated_price TO anon, authenticated;

-- ============================================
-- 4. v_catalog_products_full
-- ============================================

DROP VIEW IF EXISTS v_catalog_products_full CASCADE;

CREATE OR REPLACE VIEW v_catalog_products_full
WITH (security_invoker = true)  -- Use querying user's permissions
AS
SELECT 
    p.id,
    p.title,
    p.name,
    p.description,
    p.thumbnail_image,
    p.images,
    p.price,
    p.price_display,
    p.price_override,
    p.karat,
    p.weight,
    p.weight_grams,
    p.specs,
    p.stock_status,
    p.is_featured,
    p.is_best_seller,
    p.is_active,
    p.display_order,
    p.category_id,
    p.subcategory_id,
    p.video_url,
    p.custom_shopee_link,
    p.custom_whatsapp_number,
    p.view_count,
    p.created_at,
    p.updated_at,
    -- Category info
    c.id as category_id_full,
    c.name as category_name,
    c.slug as category_slug,
    c.description as category_description,
    c.icon as category_icon,
    c.is_active as category_is_active,
    -- Subcategory info
    s.id as subcategory_id_full,
    s.name as subcategory_name,
    s.slug as subcategory_slug,
    s.description as subcategory_description,
    s.is_active as subcategory_is_active
FROM catalog_products p
LEFT JOIN catalog_categories c ON p.category_id = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id;

-- Grant read access to anon and authenticated
GRANT SELECT ON v_catalog_products_full TO anon, authenticated;

-- ============================================
-- 5. Verification
-- ============================================

-- Check that views are now SECURITY INVOKER
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'v_best_sellers',
    'v_featured_products',
    'vw_products_with_calculated_price',
    'v_catalog_products_full'
)
ORDER BY viewname;

-- ============================================
-- Notes:
-- ============================================
-- SECURITY INVOKER means:
-- - Views respect RLS policies of the querying user
-- - Anon users will only see data allowed by public_read_* policies
-- - Authenticated users will see data based on their role
-- 
-- We explicitly GRANT SELECT to anon and authenticated because:
-- - These views are for public display (website)
-- - catalog_products table already has public_read_products policy
-- - Views will respect that underlying policy
