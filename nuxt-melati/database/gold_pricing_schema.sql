-- ============================================
-- GOLD PRICING SYSTEM SCHEMA
-- ============================================

-- 1. Tabel Setting Harga Emas Per Gram
CREATE TABLE IF NOT EXISTS gold_price_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  karat varchar(10) UNIQUE NOT NULL,
  price_per_gram decimal(15,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  updated_by uuid REFERENCES admin_users(id)
);

-- 2. Tabel History Perubahan Harga
CREATE TABLE IF NOT EXISTS gold_price_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  karat varchar(10) NOT NULL,
  old_price decimal(15,2),
  new_price decimal(15,2) NOT NULL,
  changed_by uuid REFERENCES admin_users(id),
  changed_at timestamp DEFAULT now(),
  notes text
);

-- 3. Update Tabel Products - Tambah Kolom
ALTER TABLE catalog_products 
ADD COLUMN IF NOT EXISTS weight_grams decimal(10,2),
ADD COLUMN IF NOT EXISTS price_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS base_price decimal(15,2);

-- 4. Insert Default Gold Prices
INSERT INTO gold_price_settings (karat, price_per_gram, is_active) VALUES
('8K', 450000, true),
('9K', 500000, true),
('16K', 850000, true),
('17K', 900000, true),
('18K', 950000, true),
('22K', 1150000, true)
ON CONFLICT (karat) DO NOTHING;

-- 5. Migrate Existing Weight Data
-- Extract numeric value from weight string (e.g., "4.5 gram" -> 4.5)
UPDATE catalog_products 
SET weight_grams = CAST(REGEXP_REPLACE(weight, '[^0-9.]', '', 'g') AS decimal)
WHERE weight IS NOT NULL 
  AND weight ~ '[0-9]'
  AND weight_grams IS NULL;

-- 6. Calculate Initial Base Prices
UPDATE catalog_products p
SET base_price = (
  SELECT p.weight_grams * gps.price_per_gram
  FROM gold_price_settings gps
  WHERE gps.karat = p.karat AND gps.is_active = true
)
WHERE p.weight_grams IS NOT NULL 
  AND p.karat IS NOT NULL
  AND p.price_override = false
  AND p.base_price IS NULL;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_gold_price_karat ON gold_price_settings(karat, is_active);
CREATE INDEX IF NOT EXISTS idx_gold_history_karat ON gold_price_history(karat, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_pricing ON catalog_products(karat, weight_grams, price_override);

-- 8. Function: Auto-log Price Changes
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

-- 9. Trigger for Auto-logging
DROP TRIGGER IF EXISTS trigger_log_gold_price_change ON gold_price_settings;
CREATE TRIGGER trigger_log_gold_price_change
  AFTER UPDATE ON gold_price_settings
  FOR EACH ROW
  EXECUTE FUNCTION log_gold_price_change();

-- 10. View: Products with Calculated Prices
CREATE OR REPLACE VIEW vw_products_with_calculated_price AS
SELECT 
  p.*,
  gps.price_per_gram,
  CASE 
    WHEN p.price_override THEN p.price
    WHEN p.weight_grams IS NOT NULL AND gps.price_per_gram IS NOT NULL 
      THEN p.weight_grams * gps.price_per_gram
    ELSE p.price
  END AS calculated_price
FROM catalog_products p
LEFT JOIN gold_price_settings gps ON p.karat = gps.karat AND gps.is_active = true;
