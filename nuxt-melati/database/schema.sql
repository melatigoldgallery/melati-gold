-- ============================================================
-- MELATI GOLD — Complete Database Schema
-- Version: 2.0 (Consolidated)
--
-- Urutan eksekusi pada project Supabase baru:
--   1. schema.sql  ← file ini  (DDL + fungsi + RLS + views)
--   2. seed.sql                (data default)
--   3. link_users.sql          (manual, butuh UUID dari Supabase Auth)
--
-- Aman dijalankan berulang: semua statement pakai IF NOT EXISTS
-- atau OR REPLACE.
-- ============================================================


-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- uuid_generate_v4()


-- ============================================================
-- SECTION 2: TABLES  (urutan: tidak ada FK → ada FK)
-- ============================================================

-- ----------------------------------------------------------
-- 2.1 admin_users
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_uid      uuid        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username      varchar(50) UNIQUE NOT NULL,
  password_hash text        NOT NULL,
  full_name     varchar(100),
  email         varchar(100),
  role          text        DEFAULT 'admin' CHECK (role IN ('admin', 'supervisor')),
  is_active     boolean     DEFAULT true,
  last_login    timestamp,
  created_at    timestamp   DEFAULT now(),
  updated_at    timestamp   DEFAULT now()
);


-- ----------------------------------------------------------
-- 2.2 catalog_categories
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_categories (
  id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  name          varchar(100) NOT NULL,
  slug          text         UNIQUE,
  description   text,
  cover_image   text,
  icon          varchar(50),
  display_order integer      DEFAULT 0,
  is_active     boolean      DEFAULT true,
  created_at    timestamp    DEFAULT now(),
  updated_at    timestamp    DEFAULT now()
);

-- ----------------------------------------------------------
-- 2.3 catalog_subcategories
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_subcategories (
  id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id   uuid         REFERENCES catalog_categories(id) ON DELETE CASCADE,
  name          varchar(100) NOT NULL,
  slug          text,
  description   text,
  cover_image   text,
  display_order integer      DEFAULT 0,
  is_active     boolean      DEFAULT true,
  created_at    timestamp    DEFAULT now(),
  updated_at    timestamp    DEFAULT now(),

  UNIQUE(category_id, slug)
);

-- ----------------------------------------------------------
-- 2.4 catalog_products
--     Semua kolom yang sebelumnya ditambahkan via ALTER TABLE
--     (slug, video_url, weight_grams, custom_*_link, dsb.)
--     sudah disatukan di sini.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_products (
  id                     uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id            uuid          REFERENCES catalog_categories(id) ON DELETE CASCADE,
  subcategory_id         uuid          REFERENCES catalog_subcategories(id) ON DELETE CASCADE,

  -- Informasi dasar
  title                  varchar(255)  NOT NULL,
  name                   varchar(255),
  slug                   text          UNIQUE,
  description            text,

  -- Harga
  price                  decimal(15,2),
  price_display          varchar(100),
  price_override         boolean       DEFAULT false,
  base_price             decimal(15,2),

  -- Media
  thumbnail_image        text,
  images                 jsonb         DEFAULT '[]',
  video_url              text,

  -- Spesifikasi fisik
  weight                 varchar(50),
  weight_grams           decimal(10,2),
  karat                  varchar(20),
  specs                  jsonb         DEFAULT '[]',

  -- Status & flag
  is_featured            boolean       DEFAULT false,
  is_best_seller         boolean       DEFAULT false,
  is_active              boolean       DEFAULT true,
  stock_status           varchar(20)   DEFAULT 'available',

  -- Link toko (override per-produk, opsional)
  custom_shopee_link     text,
  custom_whatsapp_number varchar(20),
  custom_tokopedia_link  text,

  -- Metadata
  display_order          integer       DEFAULT 0,
  view_count             integer       DEFAULT 0,
  created_at             timestamp     DEFAULT now(),
  updated_at             timestamp     DEFAULT now()
);

-- ----------------------------------------------------------
-- 2.5 custom_services
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_services (
  id               uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  title            varchar(255) NOT NULL,
  subtitle         varchar(255),
  description      text,
  icon             varchar(100),
  image_url        text,
  features         jsonb        DEFAULT '[]',
  duration         varchar(100),
  price_info       text,
  example_products uuid[]       DEFAULT '{}',
  is_active        boolean      DEFAULT true,
  display_order    integer      DEFAULT 0,
  created_at       timestamp    DEFAULT now(),
  updated_at       timestamp    DEFAULT now()
);

-- ----------------------------------------------------------
-- 2.6 best_seller_analytics
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS best_seller_analytics (
  id             uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id     uuid      REFERENCES catalog_products(id) ON DELETE CASCADE,
  month          date      NOT NULL,
  view_count     integer   DEFAULT 0,
  inquiry_count  integer   DEFAULT 0,
  sales_estimate integer   DEFAULT 0,
  created_at     timestamp DEFAULT now(),
  updated_at     timestamp DEFAULT now(),

  UNIQUE(product_id, month)
);

-- ----------------------------------------------------------
-- 2.7 gold_price_settings
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold_price_settings (
  id             uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  karat          varchar(10)   UNIQUE NOT NULL,
  price_per_gram decimal(15,2) NOT NULL,
  is_active      boolean       DEFAULT true,
  updated_by     uuid          REFERENCES admin_users(id),
  created_at     timestamp     DEFAULT now(),
  updated_at     timestamp     DEFAULT now()
);

-- ----------------------------------------------------------
-- 2.8 gold_price_history
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gold_price_history (
  id         uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  karat      varchar(10)   NOT NULL,
  old_price  decimal(15,2),
  new_price  decimal(15,2) NOT NULL,
  changed_by uuid          REFERENCES admin_users(id),
  changed_at timestamp     DEFAULT now(),
  notes      text
);

-- ----------------------------------------------------------
-- 2.9 karat_configurations
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS karat_configurations (
  id                        uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  category                  varchar(50)  NOT NULL UNIQUE,
  name                      varchar(100) NOT NULL,
  karat_list                text[]       NOT NULL,
  shopee_store_url          text,
  tokopedia_store_url       text,
  whatsapp_number           varchar(20),
  whatsapp_message_template text,
  is_active                 boolean      DEFAULT true,
  created_at                timestamptz  DEFAULT now(),
  updated_at                timestamptz  DEFAULT now()
);


-- ============================================================
-- SECTION 3: INDEXES
-- Duplikat & redundant sudah dihapus.
-- ============================================================

-- admin_users
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_uid    ON admin_users(auth_uid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username    ON admin_users(username);
CREATE        INDEX IF NOT EXISTS idx_admin_users_role_active ON admin_users(role, is_active);

-- catalog_categories
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_categories_slug   ON catalog_categories(slug);
CREATE        INDEX IF NOT EXISTS idx_catalog_categories_active ON catalog_categories(is_active, display_order);

-- catalog_subcategories
CREATE INDEX IF NOT EXISTS idx_catalog_subcategories_category ON catalog_subcategories(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_subcategories_slug     ON catalog_subcategories(category_id, slug);

-- catalog_products
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_products_slug        ON catalog_products(slug) WHERE slug IS NOT NULL;
CREATE        INDEX IF NOT EXISTS idx_catalog_products_category    ON catalog_products(category_id, is_active);
CREATE        INDEX IF NOT EXISTS idx_catalog_products_subcategory ON catalog_products(subcategory_id, is_active);
CREATE        INDEX IF NOT EXISTS idx_catalog_products_featured    ON catalog_products(is_featured, is_active);
CREATE        INDEX IF NOT EXISTS idx_catalog_products_best_seller ON catalog_products(is_best_seller, is_active);
CREATE        INDEX IF NOT EXISTS idx_catalog_products_pricing     ON catalog_products(karat, weight_grams, price_override);
CREATE        INDEX IF NOT EXISTS idx_catalog_products_weight      ON catalog_products(weight_grams) WHERE is_active = true;
CREATE        INDEX IF NOT EXISTS idx_catalog_products_video       ON catalog_products(video_url)    WHERE video_url IS NOT NULL;

-- custom_services
CREATE INDEX IF NOT EXISTS idx_custom_services_active          ON custom_services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_custom_services_example_products ON custom_services USING GIN (example_products);

-- gold_price_settings
CREATE INDEX IF NOT EXISTS idx_gold_price_karat   ON gold_price_settings(karat, is_active);

-- gold_price_history
CREATE INDEX IF NOT EXISTS idx_gold_history_karat ON gold_price_history(karat, changed_at DESC);

-- karat_configurations
CREATE INDEX IF NOT EXISTS idx_karat_config_active ON karat_configurations(is_active);


-- ============================================================
-- SECTION 4: FUNCTIONS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1 Admin authentication (bcrypt via pgcrypto)
-- CATATAN KEAMANAN: Fallback plain-text password dihapus
-- karena merupakan celah keamanan (hardcoded credential).
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION verify_admin_password(p_username varchar, p_password text)
RETURNS boolean AS $$
DECLARE
  v_password_hash text;
BEGIN
  SELECT password_hash INTO v_password_hash
  FROM admin_users
  WHERE username = p_username AND is_active = true;

  IF v_password_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_password_hash = crypt(p_password, v_password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION create_admin_user(
  p_username  varchar,
  p_password  text,
  p_full_name varchar,
  p_email     varchar,
  p_role      varchar DEFAULT 'admin'
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO admin_users (username, password_hash, full_name, email, role)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_full_name, p_email, p_role)
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_admin_password(p_user_id uuid, p_new_password text)
RETURNS boolean AS $$
BEGIN
  UPDATE admin_users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at    = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 4.2 RBAC helper functions
--     Menggunakan email auth.users agar tidak ada circular
--     dependency ke admin_users.
--     Untuk menambah admin baru: update daftar email di
--     fungsi is_admin_user() di bawah.
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS text AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = auth.uid();

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_supervisor()
RETURNS boolean AS $$
BEGIN
  RETURN get_current_user_email() = 'fattahula98@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN get_current_user_email() IN (
    'fattahula98@gmail.com',       -- supervisor
    'melatigoldshopid@gmail.com'   -- admin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 4.3 Gold price auto-log
-- ----------------------------------------------------------

CREATE OR REPLACE FUNCTION log_gold_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price_per_gram IS DISTINCT FROM NEW.price_per_gram THEN
    INSERT INTO gold_price_history (karat, old_price, new_price, changed_by, notes)
    VALUES (NEW.karat, OLD.price_per_gram, NEW.price_per_gram, NEW.updated_by,
            'Auto-logged price change');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SECTION 5: TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trigger_log_gold_price_change ON gold_price_settings;
CREATE TRIGGER trigger_log_gold_price_change
  AFTER UPDATE ON gold_price_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_gold_price_change();


-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE catalog_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users           ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempoten — aman dijalankan ulang)
DROP POLICY IF EXISTS "public_read_categories"           ON catalog_categories;
DROP POLICY IF EXISTS "authenticated_full_categories"    ON catalog_categories;
DROP POLICY IF EXISTS "public_read_subcategories"        ON catalog_subcategories;
DROP POLICY IF EXISTS "authenticated_full_subcategories" ON catalog_subcategories;
DROP POLICY IF EXISTS "public_read_products"             ON catalog_products;
DROP POLICY IF EXISTS "authenticated_full_products"      ON catalog_products;
DROP POLICY IF EXISTS "public_read_services"             ON custom_services;
DROP POLICY IF EXISTS "authenticated_full_services"      ON custom_services;
DROP POLICY IF EXISTS "supervisor_read_users"            ON admin_users;
DROP POLICY IF EXISTS "supervisor_insert_users"          ON admin_users;
DROP POLICY IF EXISTS "supervisor_update_users"          ON admin_users;
DROP POLICY IF EXISTS "supervisor_delete_users"          ON admin_users;
DROP POLICY IF EXISTS "admin_read_own_data"              ON admin_users;

-- Public read (anon & authenticated)
CREATE POLICY "public_read_categories"
  ON catalog_categories    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_read_subcategories"
  ON catalog_subcategories FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_read_products"
  ON catalog_products      FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_read_services"
  ON custom_services       FOR SELECT TO anon, authenticated USING (is_active = true);

-- Full CRUD untuk admin & supervisor
CREATE POLICY "authenticated_full_categories"
  ON catalog_categories    FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "authenticated_full_subcategories"
  ON catalog_subcategories FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "authenticated_full_products"
  ON catalog_products      FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "authenticated_full_services"
  ON custom_services       FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

-- admin_users: hanya supervisor yang bisa manage
CREATE POLICY "supervisor_read_users"
  ON admin_users FOR SELECT   TO authenticated USING (is_supervisor());

CREATE POLICY "supervisor_insert_users"
  ON admin_users FOR INSERT   TO authenticated WITH CHECK (is_supervisor());

CREATE POLICY "supervisor_update_users"
  ON admin_users FOR UPDATE   TO authenticated
  USING (is_supervisor()) WITH CHECK (is_supervisor());

CREATE POLICY "supervisor_delete_users"
  ON admin_users FOR DELETE   TO authenticated USING (is_supervisor());

-- Admin hanya bisa lihat data dirinya sendiri
CREATE POLICY "admin_read_own_data"
  ON admin_users FOR SELECT   TO authenticated
  USING (auth_uid = auth.uid() AND role = 'admin' AND is_active = true);


-- ============================================================
-- SECTION 7: VIEWS  (semua pakai SECURITY INVOKER agar
--            menghormati RLS user yang memanggil)
-- ============================================================

-- ----------------------------------------------------------
-- 7.1 v_best_sellers
-- ----------------------------------------------------------
DROP VIEW IF EXISTS v_best_sellers CASCADE;
CREATE OR REPLACE VIEW v_best_sellers
WITH (security_invoker = true)
AS
SELECT
  p.id, p.title, p.name, p.description,
  p.thumbnail_image, p.images, p.video_url,
  p.price, p.price_display, p.karat, p.weight, p.weight_grams,
  p.specs, p.stock_status, p.slug,
  p.is_featured, p.is_best_seller, p.is_active, p.display_order,
  p.custom_shopee_link, p.custom_whatsapp_number, p.custom_tokopedia_link,
  p.category_id, p.subcategory_id,
  c.name AS category_name,   c.slug AS category_slug,
  s.name AS subcategory_name, s.slug AS subcategory_slug
FROM catalog_products p
LEFT JOIN catalog_categories    c ON p.category_id    = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_best_seller = true AND p.is_active = true
ORDER BY p.display_order ASC;

GRANT SELECT ON v_best_sellers TO anon, authenticated;

-- ----------------------------------------------------------
-- 7.2 v_featured_products
-- ----------------------------------------------------------
DROP VIEW IF EXISTS v_featured_products CASCADE;
CREATE OR REPLACE VIEW v_featured_products
WITH (security_invoker = true)
AS
SELECT
  p.id, p.title, p.name, p.description,
  p.thumbnail_image, p.images, p.video_url,
  p.price, p.price_display, p.karat, p.weight, p.weight_grams,
  p.specs, p.stock_status, p.slug,
  p.is_featured, p.is_best_seller, p.is_active, p.display_order,
  p.custom_shopee_link, p.custom_whatsapp_number, p.custom_tokopedia_link,
  p.category_id, p.subcategory_id,
  c.name AS category_name,   c.slug AS category_slug,
  s.name AS subcategory_name, s.slug AS subcategory_slug
FROM catalog_products p
LEFT JOIN catalog_categories    c ON p.category_id    = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_featured = true AND p.is_active = true
ORDER BY p.display_order ASC;

GRANT SELECT ON v_featured_products TO anon, authenticated;

-- ----------------------------------------------------------
-- 7.3 vw_products_with_calculated_price (produk aktif publik)
-- ----------------------------------------------------------
DROP VIEW IF EXISTS vw_products_with_calculated_price CASCADE;
CREATE OR REPLACE VIEW vw_products_with_calculated_price
WITH (security_invoker = true)
AS
SELECT
  p.id, p.title, p.name, p.description,
  p.thumbnail_image, p.images, p.video_url,
  p.price, p.price_display, p.price_override,
  p.karat, p.weight, p.weight_grams, p.specs,
  p.stock_status, p.slug,
  p.is_featured, p.is_best_seller, p.is_active, p.display_order,
  p.custom_shopee_link, p.custom_whatsapp_number, p.custom_tokopedia_link,
  p.view_count, p.created_at, p.updated_at,
  p.category_id, p.subcategory_id,
  c.name AS category_name,   c.slug AS category_slug,
  s.name AS subcategory_name, s.slug AS subcategory_slug,
  p.price AS calculated_price
FROM catalog_products p
LEFT JOIN catalog_categories    c ON p.category_id    = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id
WHERE p.is_active = true;

GRANT SELECT ON vw_products_with_calculated_price TO anon, authenticated;

-- ----------------------------------------------------------
-- 7.4 v_catalog_products_full (semua produk — untuk admin)
-- ----------------------------------------------------------
DROP VIEW IF EXISTS v_catalog_products_full CASCADE;
CREATE OR REPLACE VIEW v_catalog_products_full
WITH (security_invoker = true)
AS
SELECT
  p.id, p.title, p.name, p.description,
  p.thumbnail_image, p.images, p.video_url,
  p.price, p.price_display, p.price_override,
  p.karat, p.weight, p.weight_grams, p.specs,
  p.stock_status, p.slug,
  p.is_featured, p.is_best_seller, p.is_active, p.display_order,
  p.custom_shopee_link, p.custom_whatsapp_number, p.custom_tokopedia_link,
  p.view_count, p.created_at, p.updated_at,
  p.category_id, p.subcategory_id,
  c.id   AS category_id_full,
  c.name AS category_name,   c.slug AS category_slug,
  c.description AS category_description,
  c.icon AS category_icon,   c.is_active AS category_is_active,
  s.id   AS subcategory_id_full,
  s.name AS subcategory_name,  s.slug AS subcategory_slug,
  s.description AS subcategory_description,
  s.is_active AS subcategory_is_active
FROM catalog_products p
LEFT JOIN catalog_categories    c ON p.category_id    = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id;

GRANT SELECT ON v_catalog_products_full TO anon, authenticated;


-- ============================================================
-- SECTION 8: COLUMN COMMENTS
-- ============================================================

COMMENT ON TABLE  karat_configurations                          IS 'Konfigurasi global link Shopee, Tokopedia & WhatsApp per kategori kadar emas';
COMMENT ON COLUMN catalog_products.slug                         IS 'URL-friendly slug untuk routing SEO (contoh: cincin-emas-18k)';
COMMENT ON COLUMN catalog_products.video_url                    IS 'URL video produk opsional — ditampilkan setelah gambar pertama di gallery';
COMMENT ON COLUMN catalog_products.weight_grams                 IS 'Berat numerik (gram) untuk kalkulasi harga dan sorting';
COMMENT ON COLUMN catalog_products.price_override               IS 'true = harga di-set manual, tidak dihitung otomatis';
COMMENT ON COLUMN catalog_products.custom_shopee_link           IS 'Override link Shopee per-produk (opsional)';
COMMENT ON COLUMN catalog_products.custom_whatsapp_number       IS 'Override nomor WhatsApp per-produk (opsional)';
COMMENT ON COLUMN catalog_products.custom_tokopedia_link        IS 'Override link Tokopedia per-produk (opsional)';
COMMENT ON COLUMN catalog_categories.slug                       IS 'URL-friendly slug (contoh: cincin, gelang)';
COMMENT ON COLUMN catalog_subcategories.slug                    IS 'URL-friendly slug (contoh: anak, fashion, pria)';
COMMENT ON COLUMN custom_services.example_products              IS 'Array UUID catalog_products sebagai contoh untuk service ini';
COMMENT ON COLUMN karat_configurations.tokopedia_store_url      IS 'Link toko Tokopedia (bukan produk spesifik)';
