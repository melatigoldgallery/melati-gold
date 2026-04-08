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


-- ============================================================
-- SECTION 9: TABEL INVENTORI & PESANAN
-- ============================================================

-- ----------------------------------------------------------
-- 9.1 product_variants  (stok per varian produk)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id                   uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id           uuid         NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  sku                  varchar(60)  UNIQUE NOT NULL,
  variant_label        varchar(100),              -- "Ukuran 16", "Rose Gold", dsb.
  current_stock        integer      DEFAULT 0,
  stock_booked         integer      DEFAULT 0,    -- stok dipesan tapi belum dibayar
  min_stock_threshold  integer      DEFAULT 2,
  is_active            boolean      DEFAULT true,
  created_at           timestamp    DEFAULT now(),
  updated_at           timestamp    DEFAULT now()
);

-- ----------------------------------------------------------
-- 9.2 orders
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                       uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number             varchar(30)   UNIQUE NOT NULL,   -- ORD-YYYYMMDD-XXX
  customer_name            varchar(150)  NOT NULL,
  customer_phone           varchar(20)   NOT NULL,
  customer_address         text,
  status                   varchar(20)   DEFAULT 'pending'
                             CHECK (status IN ('pending','paid','processing','shipped','completed','cancelled')),
  payment_method           varchar(20)   DEFAULT 'transfer'
                             CHECK (payment_method IN ('transfer','cod','gateway')),
  payment_proof_url        text,
  shipping_tracking_number varchar(60),
  shipping_courier         varchar(60),
  total_amount             numeric(15,2) NOT NULL,
  notes                    text,
  created_by               uuid          REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at               timestamp     DEFAULT now(),
  updated_at               timestamp     DEFAULT now()
);

-- ----------------------------------------------------------
-- 9.3 order_items
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id             uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       uuid          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     uuid          REFERENCES catalog_products(id) ON DELETE SET NULL,
  variant_id     uuid          REFERENCES product_variants(id) ON DELETE SET NULL,
  product_title  varchar(255)  NOT NULL,   -- snapshot saat order
  product_sku    varchar(60)   NOT NULL,
  karat_type     varchar(20),
  weight_grams   numeric(8,3),
  unit_price     numeric(15,2) NOT NULL,
  quantity       integer       DEFAULT 1   CHECK (quantity > 0),
  subtotal       numeric(15,2) NOT NULL,
  created_at     timestamp     DEFAULT now()
);

-- ----------------------------------------------------------
-- 9.4 stock_logs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_logs (
  id              uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id      uuid         NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  order_id        uuid         REFERENCES orders(id) ON DELETE SET NULL,
  change_type     varchar(20)  NOT NULL
                    CHECK (change_type IN ('sale','restock','adjustment','return','booking','unbook')),
  quantity_change integer      NOT NULL,   -- positif = tambah, negatif = kurang
  stock_before    integer      NOT NULL,
  stock_after     integer      NOT NULL,
  notes           text,
  created_by      uuid         REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at      timestamp    DEFAULT now()
);

-- ----------------------------------------------------------
-- 9.5 admin_audit_logs
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id             uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id  uuid         REFERENCES admin_users(id) ON DELETE SET NULL,
  action         varchar(50)  NOT NULL,   -- 'update_stock' | 'change_order_status' | 'update_price'
  target_table   varchar(60),
  target_id      uuid,
  old_values     jsonb,
  new_values     jsonb,
  ip_address     varchar(45),
  created_at     timestamp    DEFAULT now()
);


-- ============================================================
-- SECTION 10: INDEXES UNTUK TABEL BARU
-- ============================================================

CREATE        INDEX IF NOT EXISTS idx_product_variants_product  ON product_variants(product_id, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku      ON product_variants(sku);
CREATE        INDEX IF NOT EXISTS idx_product_variants_stock    ON product_variants(current_stock) WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_number             ON orders(order_number);
CREATE        INDEX IF NOT EXISTS idx_orders_status             ON orders(status, created_at DESC);
CREATE        INDEX IF NOT EXISTS idx_orders_customer_phone     ON orders(customer_phone);
CREATE        INDEX IF NOT EXISTS idx_orders_created_at         ON orders(created_at DESC);

CREATE        INDEX IF NOT EXISTS idx_order_items_order         ON order_items(order_id);
CREATE        INDEX IF NOT EXISTS idx_order_items_product       ON order_items(product_id);
CREATE        INDEX IF NOT EXISTS idx_order_items_variant       ON order_items(variant_id);

CREATE        INDEX IF NOT EXISTS idx_stock_logs_variant        ON stock_logs(variant_id, created_at DESC);
CREATE        INDEX IF NOT EXISTS idx_stock_logs_order          ON stock_logs(order_id) WHERE order_id IS NOT NULL;
CREATE        INDEX IF NOT EXISTS idx_stock_logs_type           ON stock_logs(change_type, created_at DESC);

CREATE        INDEX IF NOT EXISTS idx_audit_logs_admin          ON admin_audit_logs(admin_user_id, created_at DESC);
CREATE        INDEX IF NOT EXISTS idx_audit_logs_target         ON admin_audit_logs(target_table, target_id);
CREATE        INDEX IF NOT EXISTS idx_audit_logs_created        ON admin_audit_logs(created_at DESC);


-- ============================================================
-- SECTION 11: FUNCTIONS & TRIGGERS UNTUK INVENTORI
-- ============================================================

-- ----------------------------------------------------------
-- 11.1 Auto-generate order_number
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  v_date   text;
  v_seq    integer;
  v_number text;
BEGIN
  v_date := to_char(now(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO v_seq
  FROM orders
  WHERE order_number LIKE 'ORD-' || v_date || '-%';

  v_number := 'ORD-' || v_date || '-' || LPAD(v_seq::text, 3, '0');
  NEW.order_number := v_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ----------------------------------------------------------
-- 11.2 Auto-log stock changes
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stock IS DISTINCT FROM NEW.current_stock THEN
    INSERT INTO stock_logs (
      variant_id, change_type, quantity_change,
      stock_before, stock_after, notes, created_by
    )
    VALUES (
      NEW.id,
      'adjustment',
      NEW.current_stock - OLD.current_stock,
      OLD.current_stock,
      NEW.current_stock,
      'Auto-logged via trigger',
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_stock_change ON product_variants;
CREATE TRIGGER trigger_log_stock_change
  AFTER UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION log_stock_change();


-- ============================================================
-- SECTION 12: RLS UNTUK TABEL BARU
-- ============================================================

ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs   ENABLE ROW LEVEL SECURITY;

-- product_variants: publik bisa baca stok yang aktif
DROP POLICY IF EXISTS "public_read_variants"       ON product_variants;
DROP POLICY IF EXISTS "admin_full_variants"        ON product_variants;
CREATE POLICY "public_read_variants"
  ON product_variants FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "admin_full_variants"
  ON product_variants FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

-- orders & order_items: hanya admin
DROP POLICY IF EXISTS "admin_full_orders"          ON orders;
DROP POLICY IF EXISTS "admin_full_order_items"     ON order_items;
DROP POLICY IF EXISTS "admin_full_stock_logs"      ON stock_logs;
DROP POLICY IF EXISTS "admin_read_audit_logs"      ON admin_audit_logs;
DROP POLICY IF EXISTS "supervisor_full_audit_logs" ON admin_audit_logs;

CREATE POLICY "admin_full_orders"
  ON orders FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "admin_full_order_items"
  ON order_items FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "admin_full_stock_logs"
  ON stock_logs FOR ALL TO authenticated
  USING (is_admin_user()) WITH CHECK (is_admin_user());

-- audit_logs: hanya supervisor bisa baca/hapus; admin bisa insert
CREATE POLICY "admin_read_audit_logs"
  ON admin_audit_logs FOR SELECT TO authenticated USING (is_admin_user());
CREATE POLICY "supervisor_full_audit_logs"
  ON admin_audit_logs FOR ALL TO authenticated
  USING (is_supervisor()) WITH CHECK (is_supervisor());

GRANT SELECT               ON product_variants TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items       TO authenticated;
GRANT SELECT, INSERT                 ON stock_logs        TO authenticated;
GRANT SELECT, INSERT                 ON admin_audit_logs  TO authenticated;
