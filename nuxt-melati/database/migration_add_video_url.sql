-- ============================================
-- MIGRATION: Add video_url column to catalog_products
-- Menambahkan fitur video URL untuk produk (opsional)
-- ============================================

-- Add video_url column
ALTER TABLE catalog_products 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN catalog_products.video_url IS 'URL video produk dari Cloudinary (opsional). Video akan ditampilkan setelah gambar pertama di gallery.';

-- Create index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_catalog_products_video ON catalog_products(video_url) WHERE video_url IS NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: video_url column added to catalog_products';
END $$;
