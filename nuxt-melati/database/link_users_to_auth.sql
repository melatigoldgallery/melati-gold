-- ============================================================
-- MELATI GOLD — Link Admin Users ke Supabase Auth
--
-- Jalankan file ini SETELAH:
--   1. schema.sql ✓
--   2. seed.sql   ✓
--   3. Membuat user di Supabase Dashboard (langkah di bawah)
-- ============================================================


-- ============================================================
-- LANGKAH 1: Buat user di Supabase Dashboard
-- ============================================================
-- Buka: Authentication > Users > Add User
--
-- Buat 2 user berikut (email harus sama persis dengan yang
-- ada di fungsi is_admin_user() di schema.sql):
--
--   Email: fattahula98@gmail.com     → role: supervisor
--   Email: melatigoldshopid@gmail.com → role: admin
--
-- Catat UUID masing-masing user setelah dibuat.


-- ============================================================
-- LANGKAH 2: Tautkan UUID ke tabel admin_users
-- Ganti [SUPERVISOR-UUID] dan [ADMIN-UUID] dengan UUID asli.
-- ============================================================

-- Jika perlu reset link lama:
-- UPDATE admin_users SET auth_uid = NULL WHERE username IN ('supervisor', 'admin');

UPDATE admin_users
SET auth_uid = '[SUPERVISOR-UUID]',   -- ganti dengan UUID asli
    email    = 'fattahula98@gmail.com',
    role     = 'supervisor'
WHERE username = 'supervisor';

UPDATE admin_users
SET auth_uid = '[ADMIN-UUID]',        -- ganti dengan UUID asli
    email    = 'melatigoldshopid@gmail.com',
    role     = 'admin'
WHERE username = 'admin';


-- ============================================================
-- LANGKAH 3: Verifikasi
-- ============================================================

SELECT id, username, email, role, auth_uid, is_active
FROM admin_users
WHERE username IN ('supervisor', 'admin')
ORDER BY role DESC;

-- Hasil yang diharapkan:
-- Kedua baris memiliki auth_uid terisi
-- supervisor → role = 'supervisor'
-- admin      → role = 'admin'
