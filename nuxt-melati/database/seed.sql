-- ============================================================
-- MELATI GOLD — Default Seed Data
-- Version: 2.0 (Consolidated)
--
-- Jalankan SETELAH schema.sql berhasil dieksekusi.
-- Semua INSERT menggunakan ON CONFLICT DO NOTHING agar
-- aman dijalankan ulang tanpa duplikat data.
-- ============================================================


-- ============================================================
-- SECTION 1: ADMIN USERS (default)
-- Password di-hash dengan bcrypt (gen_salt('bf')).
-- Ganti segera setelah pertama kali login.
-- ============================================================

-- Default supervisor (ganti password via Supabase Auth setelah setup)
INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active)
VALUES (
  'supervisor',
  crypt('GantiPasswordIni!', gen_salt('bf')),
  'Supervisor',
  'supervisor@melati.com',
  'supervisor',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Default admin
INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active)
VALUES (
  'admin',
  crypt('GantiPasswordIni!', gen_salt('bf')),
  'Admin',
  'admin@melati.com',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- SECTION 2: CATALOG CATEGORIES
-- ============================================================

INSERT INTO catalog_categories (name, slug, description, cover_image, icon, display_order, is_active) VALUES
('Kalung',  'kalung',  'Koleksi kalung emas dengan berbagai desain',  '/img/necklace.jpg', 'kalung-icon',  1, true),
('Liontin', 'liontin', 'Liontin emas dengan desain eksklusif',        '/img/pandent.jpg',  'liontin-icon', 2, true),
('Anting',  'anting',  'Anting emas untuk berbagai acara',            '/img/earrings1.jpg','anting-icon',  3, true),
('Cincin',  'cincin',  'Cincin emas berkualitas tinggi',              '/img/ring.jpg',     'cincin-icon',  4, true),
('Gelang',  'gelang',  'Gelang emas dengan desain menarik',           '/img/bangle.jpg',   'gelang-icon',  5, true),
('Set',     'set',     'Set perhiasan lengkap',                       '/img/set.jpg',      'set-icon',     6, true)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- SECTION 3: CATALOG SUBCATEGORIES
-- ============================================================

-- Kalung
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Kalung untuk anak-anak',    1, true FROM catalog_categories WHERE slug = 'kalung'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Kalung fashion modern',     2, true FROM catalog_categories WHERE slug = 'kalung'
UNION ALL
SELECT id, 'Pria',    'pria',    'Kalung untuk pria',         3, true FROM catalog_categories WHERE slug = 'kalung'
ON CONFLICT DO NOTHING;

-- Liontin
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Liontin untuk anak-anak',   1, true FROM catalog_categories WHERE slug = 'liontin'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Liontin fashion modern',    2, true FROM catalog_categories WHERE slug = 'liontin'
ON CONFLICT DO NOTHING;

-- Anting
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Anting untuk anak-anak',    1, true FROM catalog_categories WHERE slug = 'anting'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Anting fashion modern',     2, true FROM catalog_categories WHERE slug = 'anting'
ON CONFLICT DO NOTHING;

-- Cincin
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Cincin untuk anak-anak',    1, true FROM catalog_categories WHERE slug = 'cincin'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Cincin fashion modern',     2, true FROM catalog_categories WHERE slug = 'cincin'
UNION ALL
SELECT id, 'Pria',    'pria',    'Cincin untuk pria',         3, true FROM catalog_categories WHERE slug = 'cincin'
ON CONFLICT DO NOTHING;

-- Gelang
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Gelang untuk anak-anak',    1, true FROM catalog_categories WHERE slug = 'gelang'
UNION ALL
SELECT id, 'Bangle',  'bangle',  'Gelang bangle',             2, true FROM catalog_categories WHERE slug = 'gelang'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Gelang fashion modern',     3, true FROM catalog_categories WHERE slug = 'gelang'
ON CONFLICT DO NOTHING;

-- Set
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak',    'anak',    'Set perhiasan anak',        1, true FROM catalog_categories WHERE slug = 'set'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Set perhiasan fashion',     2, true FROM catalog_categories WHERE slug = 'set'
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 4: CUSTOM SERVICES
-- ============================================================

INSERT INTO custom_services (title, subtitle, description, icon, features, duration, price_info, display_order, is_active) VALUES
(
  'Konsultasi Gratis',
  'Dapatkan Saran Terbaik',
  'Tim ahli kami siap membantu Anda memilih perhiasan yang sempurna sesuai kebutuhan dan budget.',
  'chat',
  '["Konsultasi desain", "Rekomendasi produk", "Estimasi harga", "Panduan perawatan"]'::jsonb,
  '30 menit', 'Gratis', 1, true
),
(
  'Desain Custom',
  'Wujudkan Perhiasan Impian',
  'Buat perhiasan unik sesuai desain Anda dengan bantuan tim desainer profesional kami.',
  'design',
  '["Konsultasi desain", "3D mockup", "Revisi unlimited", "Garansi kualitas"]'::jsonb,
  '14 hari kerja', 'Mulai dari Rp 500.000', 2, true
),
(
  'Perbaikan & Resize',
  'Layanan Perbaikan Profesional',
  'Perbaikan, resize, dan polish perhiasan Anda dengan teknologi modern dan tangan ahli.',
  'wrench',
  '["Resize cincin", "Perbaikan rantai", "Polish & cleaning", "Penggantian batu"]'::jsonb,
  '3-7 hari kerja', 'Mulai dari Rp 150.000', 3, true
),
(
  'Garansi Seumur Hidup',
  'Jaminan Kualitas Terbaik',
  'Semua produk kami dilengkapi dengan garansi seumur hidup untuk kualitas dan keaslian.',
  'shield',
  '["Garansi keaslian", "Free cleaning", "Perbaikan gratis", "Sertifikat resmi"]'::jsonb,
  'Seumur hidup', 'Termasuk pembelian', 4, true
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- SECTION 5: GOLD PRICE SETTINGS (harga awal — sesuaikan)
-- ============================================================

INSERT INTO gold_price_settings (karat, price_per_gram, is_active) VALUES
('8K',  450000,  true),
('9K',  500000,  true),
('16K', 850000,  true),
('17K', 900000,  true),
('18K', 950000,  true),
('22K', 1150000, true)
ON CONFLICT (karat) DO NOTHING;


-- ============================================================
-- SECTION 6: KARAT CONFIGURATIONS
-- Ganti nomor WhatsApp dan URL toko sesuai toko Anda.
-- ============================================================

INSERT INTO karat_configurations (
  category, name, karat_list,
  shopee_store_url, tokopedia_store_url, whatsapp_number, whatsapp_message_template
) VALUES
(
  'kadar_muda',
  'Kadar Muda (8K-9K)',
  ARRAY['8K', '9K'],
  'https://shopee.co.id/melatigold',
  'https://www.tokopedia.com/melatigold',
  '6281234567890',
  'Halo Admin Kadar Muda, saya tertarik dengan produk {product_name} kadar {karat}. Apakah masih tersedia?'
),
(
  'kadar_tua',
  'Kadar Tua (16K-24K)',
  ARRAY['16K', '17K', '18K', '22K', '24K'],
  'https://shopee.co.id/melatigold',
  'https://www.tokopedia.com/melatigold',
  '6289876543210',
  'Halo Admin Kadar Tua, saya tertarik dengan produk {product_name} kadar {karat}. Apakah masih tersedia?'
)
ON CONFLICT (category) DO NOTHING;


-- ============================================================
-- SECTION 7: SLUG GENERATION UTILITY
-- Jalankan bagian ini jika ada produk yang sudah masuk
-- ke database tetapi belum punya slug.
-- ============================================================

-- Generate slug dari title produk yang belum punya slug
UPDATE catalog_products
SET slug = LOWER(TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
))
WHERE slug IS NULL AND title IS NOT NULL;

-- Fallback ke name jika title juga kosong
UPDATE catalog_products
SET slug = LOWER(TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
))
WHERE slug IS NULL AND name IS NOT NULL;

-- Resolve duplicate slugs dengan suffix -2, -3, dst.
DO $$
DECLARE
  r         RECORD;
  base_slug text;
  new_slug  text;
  counter   integer;
BEGIN
  FOR r IN
    SELECT id, slug FROM catalog_products
    WHERE slug IS NOT NULL ORDER BY created_at
  LOOP
    base_slug := r.slug;
    new_slug  := base_slug;
    counter   := 2;

    WHILE EXISTS (
      SELECT 1 FROM catalog_products WHERE slug = new_slug AND id != r.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter  := counter + 1;
    END LOOP;

    IF new_slug != r.slug THEN
      UPDATE catalog_products SET slug = new_slug WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
