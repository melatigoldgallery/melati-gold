-- ============================================
-- LINK EXISTING USERS TO SUPABASE AUTH
-- Run this AFTER creating users in Supabase Authentication
-- ============================================

-- Step 1: Create users in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Create:
--   1. Email: supervisor@melati.com | Password: [your-password]
--   2. Email: admin@melati.com | Password: [your-password]
-- Copy the UUID for each user

-- Step 2: Update admin_users table with auth_uid
-- Replace [SUPERVISOR-UUID] and [ADMIN-UUID] with actual UUIDs from Step 1

-- IMPORTANT: If you get "duplicate key" error, first clear existing links:
-- UPDATE admin_users SET auth_uid = NULL WHERE username IN ('supervisor', 'admin');

-- Link Supervisor
UPDATE admin_users 
SET 
  auth_uid = '[SUPERVISOR-UUID]',  -- Replace with actual UUID
  role = 'supervisor',
  email = 'supervisor@melati.com'
WHERE username = 'supervisor';

-- Link Admin
UPDATE admin_users 
SET 
  auth_uid = '[ADMIN-UUID]',  -- Replace with actual UUID
  role = 'admin',
  email = 'admin@melati.com'
WHERE username = 'admin';

-- Step 3: Verify linkage
SELECT 
  id,
  username,
  email,
  role,
  auth_uid,
  is_active
FROM admin_users
WHERE username IN ('supervisor', 'admin')
ORDER BY role DESC;

-- Expected result:
-- Both users should have auth_uid filled
-- supervisor should have role = 'supervisor'
-- admin should have role = 'admin'

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If admin_users doesn't have supervisor/admin yet, create them:
INSERT INTO admin_users (username, email, role, password_hash, full_name, is_active)
VALUES 
  ('supervisor', 'supervisor@melati.com', 'supervisor', 'temp_hash', 'Supervisor', true),
  ('admin', 'admin@melati.com', 'admin', 'temp_hash', 'Admin', true)
ON CONFLICT (username) DO NOTHING;

-- Then run the UPDATE commands from Step 2 above
