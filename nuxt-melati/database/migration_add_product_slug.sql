-- Migration: Add slug field to catalog_products
-- Date: March 2026
-- Purpose: Enable SEO-friendly URL routing /product/nama-produk instead of /product/uuid

-- 1. Tambah kolom slug
ALTER TABLE catalog_products
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Generate slug dari title yang sudah ada
--    Aturan: lowercase, strip karakter non-alphanumeric (kecuali spasi), ganti spasi → strip berulang → hyphen
UPDATE catalog_products
SET slug = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), -- hapus karakter special
        '\s+', '-', 'g'                                    -- spasi → hyphen
      ),
      '-+', '-', 'g'                                       -- hapus double hyphen
    )
  )
)
WHERE slug IS NULL AND title IS NOT NULL;

-- 3. Untuk produk tanpa title, gunakan name sebagai fallback
UPDATE catalog_products
SET slug = LOWER(
  TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  )
)
WHERE slug IS NULL AND name IS NOT NULL;

-- 4. Handle slug duplikat: tambahkan suffix -N (contoh: cincin-emas, cincin-emas-2, cincin-emas-3)
DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR r IN
    SELECT id, slug
    FROM catalog_products
    WHERE slug IS NOT NULL
    ORDER BY created_at
  LOOP
    base_slug := r.slug;
    counter := 2;
    new_slug := base_slug;

    -- Cek apakah slug sudah dipakai produk lain yang lebih dulu
    WHILE EXISTS (
      SELECT 1 FROM catalog_products
      WHERE slug = new_slug AND id != r.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    -- Update jika perlu perubahan
    IF new_slug != r.slug THEN
      UPDATE catalog_products SET slug = new_slug WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

-- 5. Buat index untuk performa query by slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_products_slug ON catalog_products(slug)
WHERE slug IS NOT NULL;

-- 6. Verifikasi hasil
DO $$
DECLARE
  total_count INTEGER;
  slug_count INTEGER;
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM catalog_products WHERE is_active = true;
  SELECT COUNT(*) INTO slug_count FROM catalog_products WHERE slug IS NOT NULL;
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT slug, COUNT(*) FROM catalog_products
    WHERE slug IS NOT NULL
    GROUP BY slug HAVING COUNT(*) > 1
  ) d;

  RAISE NOTICE 'Total produk aktif: %', total_count;
  RAISE NOTICE 'Produk dengan slug: %', slug_count;
  RAISE NOTICE 'Slug duplikat: %', dup_count;
END $$;

-- Contoh hasil slug yang dihasilkan:
-- "Cincin Emas 18K Berlian"  → "cincin-emas-18k-berlian"
-- "Gelang Emas & Berlian"    → "gelang-emas-berlian"
-- "Kalung Emas (Custom)"     → "kalung-emas-custom"
