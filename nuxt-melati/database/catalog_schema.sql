-- ============================================
-- CATALOG MANAGEMENT SCHEMA
-- Untuk manage Katalog Produk, Best Sellers, dan Custom Services
-- ============================================

-- 1. TABEL CATALOG CATEGORIES (Kalung, Anting, Gelang, dll)
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  description text,
  cover_image text, -- URL gambar cover kategori
  icon varchar(50), -- icon name untuk UI
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_catalog_categories_active ON catalog_categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_slug ON catalog_categories(slug);

-- Insert default categories
INSERT INTO catalog_categories (name, slug, description, cover_image, icon, display_order, is_active) VALUES
('Kalung', 'kalung', 'Koleksi kalung emas dengan berbagai desain', '/img/necklace.jpg', 'kalung-icon', 1, true),
('Liontin', 'liontin', 'Liontin emas dengan desain eksklusif', '/img/pandent.jpg', 'liontin-icon', 2, true),
('Anting', 'anting', 'Anting emas untuk berbagai acara', '/img/earrings1.jpg', 'anting-icon', 3, true),
('Cincin', 'cincin', 'Cincin emas berkualitas tinggi', '/img/ring.jpg', 'cincin-icon', 4, true),
('Gelang', 'gelang', 'Gelang emas dengan desain menarik', '/img/bangle.jpg', 'gelang-icon', 5, true),
('Set', 'set', 'Set perhiasan lengkap', '/img/set.jpg', 'set-icon', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. TABEL CATALOG SUBCATEGORIES (Anak, Fashion, Pria, Bangle)
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES catalog_categories(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  slug varchar(100) NOT NULL,
  description text,
  cover_image text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(category_id, slug)
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_catalog_subcategories_category ON catalog_subcategories(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_subcategories_slug ON catalog_subcategories(category_id, slug);

-- Insert default subcategories untuk setiap kategori
-- Kalung subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Kalung untuk anak-anak', 1, true FROM catalog_categories WHERE slug = 'kalung'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Kalung fashion modern', 2, true FROM catalog_categories WHERE slug = 'kalung'
UNION ALL
SELECT id, 'Pria', 'pria', 'Kalung untuk pria', 3, true FROM catalog_categories WHERE slug = 'kalung'
ON CONFLICT DO NOTHING;

-- Liontin subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Liontin untuk anak-anak', 1, true FROM catalog_categories WHERE slug = 'liontin'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Liontin fashion modern', 2, true FROM catalog_categories WHERE slug = 'liontin'
ON CONFLICT DO NOTHING;

-- Anting subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Anting untuk anak-anak', 1, true FROM catalog_categories WHERE slug = 'anting'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Anting fashion modern', 2, true FROM catalog_categories WHERE slug = 'anting'
ON CONFLICT DO NOTHING;

-- Cincin subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Cincin untuk anak-anak', 1, true FROM catalog_categories WHERE slug = 'cincin'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Cincin fashion modern', 2, true FROM catalog_categories WHERE slug = 'cincin'
UNION ALL
SELECT id, 'Pria', 'pria', 'Cincin untuk pria', 3, true FROM catalog_categories WHERE slug = 'cincin'
ON CONFLICT DO NOTHING;

-- Gelang subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Gelang untuk anak-anak', 1, true FROM catalog_categories WHERE slug = 'gelang'
UNION ALL
SELECT id, 'Bangle', 'bangle', 'Gelang bangle', 2, true FROM catalog_categories WHERE slug = 'gelang'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Gelang fashion modern', 3, true FROM catalog_categories WHERE slug = 'gelang'
ON CONFLICT DO NOTHING;

-- Set subcategories
INSERT INTO catalog_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT id, 'Anak', 'anak', 'Set perhiasan anak', 1, true FROM catalog_categories WHERE slug = 'set'
UNION ALL
SELECT id, 'Fashion', 'fashion', 'Set perhiasan fashion', 2, true FROM catalog_categories WHERE slug = 'set'
ON CONFLICT DO NOTHING;

-- 3. TABEL CATALOG PRODUCTS (Produk per subcategory)
-- ============================================
CREATE TABLE IF NOT EXISTS catalog_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES catalog_categories(id) ON DELETE CASCADE,
  subcategory_id uuid REFERENCES catalog_subcategories(id) ON DELETE CASCADE,
  
  -- Product Information
  title varchar(255) NOT NULL,
  name varchar(255),
  description text,
  price decimal(15,2),
  price_display varchar(100), -- Format display: "Rp 3.500.000"
  
  -- Images
  thumbnail_image text, -- Main thumbnail
  images jsonb DEFAULT '[]'::jsonb, -- Array of image URLs
  
  -- Specifications
  weight varchar(50), -- "4.5 gram"
  karat varchar(20), -- "18K", "22K"
  specs jsonb DEFAULT '[]'::jsonb, -- Array of specs: ["Emas 18K", "Berat: 4.5 gram"]
  
  -- Status & Flags
  is_featured boolean DEFAULT false, -- Featured di homepage
  is_best_seller boolean DEFAULT false, -- Best seller section
  is_active boolean DEFAULT true,
  stock_status varchar(20) DEFAULT 'available', -- available, out_of_stock, pre_order
  
  -- Metadata
  display_order integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_products_subcategory ON catalog_products(subcategory_id, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_products_featured ON catalog_products(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_products_best_seller ON catalog_products(is_best_seller, is_active);

-- 4. TABEL CUSTOM SERVICES (Layanan Custom)
-- ============================================
CREATE TABLE IF NOT EXISTS custom_services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Service Information
  title varchar(255) NOT NULL,
  subtitle varchar(255),
  description text,
  icon varchar(100), -- Icon name atau URL
  image_url text, -- Service image
  
  -- Service Details
  features jsonb DEFAULT '[]'::jsonb, -- Array of features
  duration varchar(100), -- "14 hari kerja"
  price_info text, -- Info harga atau "Hubungi kami"
  
  -- Status
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index untuk custom services
CREATE INDEX IF NOT EXISTS idx_custom_services_active ON custom_services(is_active, display_order);

-- Insert default custom services
INSERT INTO custom_services (title, subtitle, description, icon, features, duration, price_info, display_order, is_active) VALUES
('Konsultasi Gratis', 'Dapatkan Saran Terbaik', 'Tim ahli kami siap membantu Anda memilih perhiasan yang sempurna sesuai kebutuhan dan budget.', 'chat', '["Konsultasi desain", "Rekomendasi produk", "Estimasi harga", "Panduan perawatan"]'::jsonb, '30 menit', 'Gratis', 1, true),
('Desain Custom', 'Wujudkan Perhiasan Impian', 'Buat perhiasan unik sesuai desain Anda dengan bantuan tim desainer profesional kami.', 'design', '["Konsultasi desain", "3D mockup", "Revisi unlimited", "Garansi kualitas"]'::jsonb, '14 hari kerja', 'Mulai dari Rp 500.000', 2, true),
('Perbaikan & Resize', 'Layanan Perbaikan Profesional', 'Perbaikan, resize, dan polish perhiasan Anda dengan teknologi modern dan tangan ahli.', 'wrench', '["Resize cincin", "Perbaikan rantai", "Polish & cleaning", "Penggantian batu"]'::jsonb, '3-7 hari kerja', 'Mulai dari Rp 150.000', 3, true),
('Garansi Seumur Hidup', 'Jaminan Kualitas Terbaik', 'Semua produk kami dilengkapi dengan garansi seumur hidup untuk kualitas dan keaslian.', 'shield', '["Garansi keaslian", "Free cleaning", "Perbaikan gratis", "Sertifikat resmi"]'::jsonb, 'Seumur hidup', 'Termasuk pembelian', 4, true)
ON CONFLICT DO NOTHING;

-- 5. TABEL BEST SELLERS (untuk tracking & display)
-- ============================================
-- Note: Best sellers menggunakan flag is_best_seller di catalog_products
-- Tabel ini opsional, bisa digunakan untuk analytics

CREATE TABLE IF NOT EXISTS best_seller_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES catalog_products(id) ON DELETE CASCADE,
  month date NOT NULL, -- Month identifier
  view_count integer DEFAULT 0,
  inquiry_count integer DEFAULT 0, -- Jumlah inquiry
  sales_estimate integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(product_id, month)
);

-- Index untuk analytics
CREATE INDEX IF NOT EXISTS idx_best_seller_analytics_month ON best_seller_analytics(month DESC);
CREATE INDEX IF NOT EXISTS idx_best_seller_analytics_product ON best_seller_analytics(product_id);

-- 6. VIEWS untuk kemudahan query
-- ============================================

-- View untuk products dengan category & subcategory info
CREATE OR REPLACE VIEW v_catalog_products_full AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  s.name as subcategory_name,
  s.slug as subcategory_slug
FROM catalog_products p
LEFT JOIN catalog_categories c ON p.category_id = c.id
LEFT JOIN catalog_subcategories s ON p.subcategory_id = s.id;

-- View untuk best sellers
CREATE OR REPLACE VIEW v_best_sellers AS
SELECT *
FROM v_catalog_products_full
WHERE is_best_seller = true AND is_active = true
ORDER BY display_order, created_at DESC;

-- View untuk featured products
CREATE OR REPLACE VIEW v_featured_products AS
SELECT *
FROM v_catalog_products_full
WHERE is_featured = true AND is_active = true
ORDER BY display_order, created_at DESC;

-- 7. FUNCTIONS untuk helper operations
-- ============================================

-- Function untuk toggle best seller
CREATE OR REPLACE FUNCTION toggle_best_seller(p_product_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE catalog_products
  SET is_best_seller = NOT is_best_seller,
      updated_at = now()
  WHERE id = p_product_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function untuk toggle featured
CREATE OR REPLACE FUNCTION toggle_featured(p_product_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE catalog_products
  SET is_featured = NOT is_featured,
      updated_at = now()
  WHERE id = p_product_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function untuk increment view count
CREATE OR REPLACE FUNCTION increment_product_view(p_product_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE catalog_products
  SET view_count = view_count + 1
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER untuk auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel
CREATE TRIGGER update_catalog_categories_updated_at BEFORE UPDATE ON catalog_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_subcategories_updated_at BEFORE UPDATE ON catalog_subcategories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_products_updated_at BEFORE UPDATE ON catalog_products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_services_updated_at BEFORE UPDATE ON custom_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SELESAI - Catalog Management Schema
-- ============================================

-- Query untuk verify setup
-- SELECT * FROM catalog_categories ORDER BY display_order;
-- SELECT * FROM catalog_subcategories ORDER BY category_id, display_order;
-- SELECT * FROM custom_services ORDER BY display_order;
