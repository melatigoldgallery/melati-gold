-- Schema untuk konfigurasi kadar emas (link Shopee & WhatsApp per kategori)
-- Sentralisasi: 2 kategori saja (kadar muda & kadar tua)

CREATE TABLE IF NOT EXISTS karat_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL UNIQUE, -- 'kadar_muda' atau 'kadar_tua'
  name VARCHAR(100) NOT NULL, -- Display name: "Kadar Muda (8K-9K)"
  karat_list TEXT[] NOT NULL, -- Array: ['8K', '9K'] atau ['16K', '18K', '20K', '21K', '22K', '23K', '24K']
  shopee_store_url TEXT, -- Link ke toko Shopee (bukan produk spesifik)
  whatsapp_number VARCHAR(20), -- Format: 6281234567890
  whatsapp_message_template TEXT, -- Template pesan: "Halo, saya tertarik dengan {product_name} kadar {karat}"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_karat_config_category ON karat_configurations(category);
CREATE INDEX IF NOT EXISTS idx_karat_config_active ON karat_configurations(is_active);

-- Insert data default
INSERT INTO karat_configurations (category, name, karat_list, shopee_store_url, whatsapp_number, whatsapp_message_template)
VALUES 
  (
    'kadar_muda',
    'Kadar Muda (8K-9K)',
    ARRAY['8K', '9K'],
    'https://shopee.co.id/melatigold',
    '6281234567890',
    'Halo Admin Kadar Muda, saya tertarik dengan produk {product_name} kadar {karat}. Apakah masih tersedia?'
  ),
  (
    'kadar_tua',
    'Kadar Tua (16K-24K)',
    ARRAY['16K', '18K', '20K', '21K', '22K', '23K', '24K'],
    'https://shopee.co.id/melatigold',
    '6289876543210',
    'Halo Admin Kadar Tua, saya tertarik dengan produk {product_name} kadar {karat}. Apakah masih tersedia?'
  )
ON CONFLICT (category) DO NOTHING;

-- Tambahkan kolom baru di tabel catalog_products untuk override opsional
ALTER TABLE catalog_products 
ADD COLUMN IF NOT EXISTS custom_shopee_link TEXT,
ADD COLUMN IF NOT EXISTS custom_whatsapp_number VARCHAR(20);

-- Buat comment untuk dokumentasi
COMMENT ON TABLE karat_configurations IS 'Konfigurasi global untuk link Shopee dan WhatsApp per kategori kadar emas';
COMMENT ON COLUMN catalog_products.custom_shopee_link IS 'Override: Link Shopee spesifik untuk produk ini (opsional)';
COMMENT ON COLUMN catalog_products.custom_whatsapp_number IS 'Override: Nomor WhatsApp khusus untuk produk ini (opsional)';
