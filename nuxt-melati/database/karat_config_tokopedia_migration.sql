-- Migration: Menambahkan support untuk Tokopedia
-- Date: 2025-11-12
-- Description: Menambahkan kolom tokopedia_store_url di karat_configurations dan catalog_products

-- 1. Tambah kolom tokopedia_store_url di karat_configurations
ALTER TABLE karat_configurations 
ADD COLUMN IF NOT EXISTS tokopedia_store_url TEXT;

-- 2. Tambah kolom custom tokopedia di catalog_products (untuk override per produk)
ALTER TABLE catalog_products 
ADD COLUMN IF NOT EXISTS custom_tokopedia_link TEXT;

-- 3. Tambahkan komentar dokumentasi
COMMENT ON COLUMN karat_configurations.tokopedia_store_url IS 'Link ke toko Tokopedia (bukan produk spesifik)';
COMMENT ON COLUMN catalog_products.custom_tokopedia_link IS 'Override: Link Tokopedia spesifik untuk produk ini (opsional)';

-- 4. Set nilai default untuk data yang sudah ada (opsional - sesuaikan dengan toko Anda)
UPDATE karat_configurations 
SET tokopedia_store_url = 'https://www.tokopedia.com/melatigold'
WHERE tokopedia_store_url IS NULL;

-- 5. Verifikasi hasil migration
-- Uncomment untuk test:
-- SELECT id, category, name, shopee_store_url, tokopedia_store_url, whatsapp_number FROM karat_configurations;
