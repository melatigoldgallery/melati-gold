-- ============================================
-- RBAC IMPLEMENTATION - Database Setup
-- Based on: RBAC_IMPLEMENTATION_GUIDE.md
-- ============================================

-- ============================================
-- 1. Update admin_users Table
-- ============================================

-- Add auth_uid column to link with Supabase Auth
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS auth_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure role column exists
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' 
CHECK (role IN ('admin', 'supervisor'));

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_uid 
ON admin_users(auth_uid);

CREATE INDEX IF NOT EXISTS idx_admin_users_username 
ON admin_users(username);

CREATE INDEX IF NOT EXISTS idx_admin_users_role 
ON admin_users(role, is_active);

-- ============================================
-- 2. Enable RLS on All Tables
-- ============================================

ALTER TABLE catalog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop Existing Policies (Clean Start)
-- ============================================

-- Categories
DROP POLICY IF EXISTS "public_read_categories" ON catalog_categories;
DROP POLICY IF EXISTS "authenticated_full_categories" ON catalog_categories;

-- Subcategories
DROP POLICY IF EXISTS "public_read_subcategories" ON catalog_subcategories;
DROP POLICY IF EXISTS "authenticated_full_subcategories" ON catalog_subcategories;

-- Products
DROP POLICY IF EXISTS "public_read_products" ON catalog_products;
DROP POLICY IF EXISTS "authenticated_full_products" ON catalog_products;

-- Services
DROP POLICY IF EXISTS "public_read_services" ON custom_services;
DROP POLICY IF EXISTS "authenticated_full_services" ON custom_services;

-- Admin Users
DROP POLICY IF EXISTS "supervisor_read_users" ON admin_users;
DROP POLICY IF EXISTS "supervisor_insert_users" ON admin_users;
DROP POLICY IF EXISTS "supervisor_update_users" ON admin_users;
DROP POLICY IF EXISTS "supervisor_delete_users" ON admin_users;
DROP POLICY IF EXISTS "admin_read_own_data" ON admin_users;

-- ============================================
-- 4. PUBLIC Policies - Read-only access
-- ============================================

CREATE POLICY "public_read_categories"
ON catalog_categories FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "public_read_subcategories"
ON catalog_subcategories FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "public_read_products"
ON catalog_products FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "public_read_services"
ON custom_services FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- ============================================
-- 5. Helper Functions (Email-based, NO admin_users query)
-- ============================================

-- Function to get user email from auth
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is supervisor
-- Based on email only - no admin_users query
CREATE OR REPLACE FUNCTION is_supervisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_email() = 'fattahula98@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin (any role)
-- Based on email only - no admin_users query
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_email() IN (
    'fattahula98@gmail.com',      -- supervisor
    'melatigoldshopid@gmail.com'  -- admin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. AUTHENTICATED Policies - Full CRUD (Both Roles)
-- ============================================

-- Categories: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_categories"
ON catalog_categories FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Subcategories: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_subcategories"
ON catalog_subcategories FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Products: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_products"
ON catalog_products FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Custom Services: Full access for both supervisor and admin
CREATE POLICY "authenticated_full_services"
ON custom_services FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- ============================================
-- 7. ADMIN_USERS Policies - Using Helper Functions
-- ============================================

-- Supervisor can view all users
CREATE POLICY "supervisor_read_users"
ON admin_users FOR SELECT
TO authenticated
USING (is_supervisor());

-- Supervisor can insert users
CREATE POLICY "supervisor_insert_users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (is_supervisor());

-- Supervisor can update users
CREATE POLICY "supervisor_update_users"
ON admin_users FOR UPDATE
TO authenticated
USING (is_supervisor())
WITH CHECK (is_supervisor());

-- Supervisor can delete users
CREATE POLICY "supervisor_delete_users"
ON admin_users FOR DELETE
TO authenticated
USING (is_supervisor());

-- Admin can only view their own data
CREATE POLICY "admin_read_own_data"
ON admin_users FOR SELECT
TO authenticated
USING (auth_uid = auth.uid() AND role = 'admin' AND is_active = true);

-- ============================================
-- 8. Verification
-- ============================================

-- Check RLS status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'catalog_categories', 
    'catalog_subcategories', 
    'catalog_products', 
    'custom_services',
    'admin_users'
)
ORDER BY tablename;

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'catalog_categories', 
    'catalog_subcategories', 
    'catalog_products', 
    'custom_services',
    'admin_users'
)
ORDER BY tablename, policyname;
