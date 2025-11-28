-- ============================================
-- DISABLE RLS FOR ADMIN OPERATIONS
-- Purpose: Fix 406 error - admin should have full access
-- ============================================

-- Disable RLS on all catalog tables
ALTER TABLE catalog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_services DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('catalog_categories', 'catalog_subcategories', 'catalog_products', 'custom_services');

-- Expected result: rls_enabled = false for all tables
