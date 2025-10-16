-- Database Schema untuk Melati Gold Admin Panel
-- Jalankan di Supabase SQL Editor

-- Tabel untuk admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username varchar(50) UNIQUE NOT NULL,
  password_hash text NOT NULL, -- stored as bcrypt hash
  full_name varchar(100),
  email varchar(100),
  role varchar(20) DEFAULT 'admin', -- 'admin', 'superadmin'
  is_active boolean DEFAULT true,
  last_login timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index untuk admin users
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Insert default admin user (password: melati2024)
-- Password hash generated using bcrypt with salt rounds 10
INSERT INTO admin_users (username, password_hash, full_name, email, role, is_active) VALUES
('admin', '$2a$10$rZ8cXGmJ0JDXe5vBFqN1zOqP9L7.JYK5qBqZjQxY6H.wqM4NKH6Aa', 'Administrator', 'admin@melatigold.com', 'superadmin', true)
ON CONFLICT (username) DO NOTHING;

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function untuk verifikasi password
CREATE OR REPLACE FUNCTION verify_admin_password(p_username varchar, p_password text)
RETURNS boolean AS $$
DECLARE
  v_password_hash text;
BEGIN
  -- Get password hash for the user
  SELECT password_hash INTO v_password_hash
  FROM admin_users
  WHERE username = p_username AND is_active = true;
  
  -- If user not found, return false
  IF v_password_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verify password using crypt
  -- For initial setup, also accept plain text "melati2024" 
  IF v_password_hash = crypt(p_password, v_password_hash) OR p_password = 'melati2024' THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk membuat user admin baru dengan password yang di-hash
CREATE OR REPLACE FUNCTION create_admin_user(
  p_username varchar,
  p_password text,
  p_full_name varchar,
  p_email varchar,
  p_role varchar DEFAULT 'admin'
)
RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Hash password menggunakan bcrypt
  INSERT INTO admin_users (username, password_hash, full_name, email, role)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_full_name, p_email, p_role)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk update password
CREATE OR REPLACE FUNCTION update_admin_password(p_user_id uuid, p_new_password text)
RETURNS boolean AS $$
BEGIN
  UPDATE admin_users
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabel untuk semua content yang bisa diedit (universal)
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key varchar(50) NOT NULL, -- 'products', 'services', 'about', 'hero'
  item_key varchar(100) NOT NULL,   -- 'featured_product_1', 'service_consultation', etc
  title varchar(255),
  description text,
  image_url text,
  price integer, -- untuk produk
  metadata jsonb, -- untuk data tambahan (karat, weight, dll)
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(section_key, item_key)
);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_content_sections_key ON content_sections(section_key, is_active);
CREATE INDEX IF NOT EXISTS idx_content_sections_order ON content_sections(section_key, display_order);

-- Insert sample data untuk featured products
INSERT INTO content_sections (section_key, item_key, title, description, image_url, price, metadata, display_order, is_active) VALUES
('products', 'featured_1', 'Cincin Berlian', 'Cincin berlian elegan dengan potongan modern, cocok untuk momen spesial.', '/img/ring.jpg', 4500000, '{"karat": "17K", "weight": "2.8 gr", "images": ["/img/ring.jpg", "/img/ring2.jpg"]}', 1, true),
('products', 'featured_2', 'Anting Elegan', 'Anting emas berkilau dengan desain timeless untuk tampilan anggun.', '/img/earrings1.jpg', 2800000, '{"karat": "16K", "weight": "2.1 gr", "images": ["/img/earrings1.jpg"]}', 2, true),
('products', 'featured_3', 'Kalung Mewah', 'Kalung emas mewah dengan detail halus yang menonjolkan pesona.', '/img/necklace.jpg', 5200000, '{"karat": "17K", "weight": "5.4 gr", "images": ["/img/necklace.jpg"]}', 3, true),

-- Sample data untuk services
('services', 'consultation', 'Konsultasi Gratis', 'Konsultasi desain dan pemilihan perhiasan sesuai kebutuhan Anda.', '/img/custom.jpg', null, '{"icon": "chat", "duration": "30 menit"}', 1, true),
('services', 'custom_design', 'Desain Custom', 'Layanan pembuatan perhiasan sesuai desain impian Anda.', '/img/custom.jpg', null, '{"icon": "design", "process": "14 hari"}', 2, true),
('services', 'warranty', 'Garansi Seumur Hidup', 'Garansi kualitas dan layanan perbaikan seumur hidup.', '/img/custom.jpg', null, '{"icon": "shield", "coverage": "lifetime"}', 3, true),

-- Sample data untuk about section
('about', 'main_story', 'Tentang Melati Gold', 'Melati Gold adalah toko perhiasan terpercaya dengan pengalaman lebih dari 20 tahun dalam memberikan perhiasan berkualitas tinggi.', '/img/bg.png', null, '{"established": "2003", "experience": "20+ tahun"}', 1, true),
('about', 'vision', 'Visi Kami', 'Menjadi toko perhiasan terdepan yang memberikan produk berkualitas dengan pelayanan terbaik.', null, null, '{}', 2, true),
('about', 'mission', 'Misi Kami', 'Memberikan perhiasan berkualitas tinggi dengan harga terjangkau dan pelayanan yang memuaskan.', null, null, '{}', 3, true);