# 💰 Gold Pricing System - Implementation Guide

## 📋 Overview

Sistem pricing otomatis berdasarkan harga emas per gram untuk setiap kadar (8K-22K). Harga produk dihitung otomatis: **berat × harga_per_gram**.

---

## 🗄️ Database Setup

### 1. Jalankan Migration

```bash
# Buka Supabase SQL Editor, jalankan:
database/gold_pricing_schema.sql
```

### Tables Created:

- **gold_price_settings**: Setting harga per kadar
- **gold_price_history**: Tracking perubahan harga
- **catalog_products**: + kolom `weight_grams`, `price_override`, `base_price`

---

## 🎯 Fitur Utama

### 1. **Gold Price Manager** (`/admin/catalog?tab=gold-prices`)

- ✅ Set harga per gram untuk 8K, 9K, 16K, 17K, 18K, 22K
- ✅ View jumlah produk terdampak per kadar
- ✅ Recalculate bulk semua harga produk
- ✅ View history perubahan harga

### 2. **Auto-Calculate Price**

```typescript
// Formula
price = weight_grams × price_per_gram

// Contoh:
// 4.5 gram × Rp 950,000/gram = Rp 4,275,000
```

### 3. **Price Override**

- Checkbox "Override Harga Manual" di form produk
- Untuk produk dengan pricing khusus (custom, promo, etc)
- Produk override TIDAK terupdate saat recalculate

---

## 📝 Usage Flow

### Admin Update Harga Emas:

1. Buka **Catalog → Harga Emas**
2. Update harga per gram (misal 18K: 950,000 → 975,000)
3. Klik **Recalculate Semua**
4. ✅ Semua produk 18K otomatis terupdate (kecuali yang override)

### Tambah Produk Baru:

1. Pilih **Kadar** (misal 18K)
2. Input **Berat** (misal 4.5 gram)
3. ✅ Harga otomatis muncul: Rp 4,275,000
4. Optional: Centang override untuk custom pricing

---

## 🔧 Technical Components

### Composable: `useGoldPricing.ts`

```typescript
const {
  getGoldPrices, // Get all gold prices
  updateGoldPrice, // Update specific karat
  calculatePrice, // Calculate product price
  recalculateAllPrices, // Bulk recalculate
  getPriceHistory, // Get change history
  getAffectedProductsCount, // Count affected products
} = useGoldPricing();
```

### Component: `GoldPriceManager.vue`

- Admin UI untuk manage gold prices
- History viewer dengan tracking perubahan

### Updated: `CatalogProductModal.vue`

- Dropdown kadar with price preview
- Weight input (numeric)
- Calculated price display
- Override checkbox

---

## 📊 Display Logic

### Frontend Display:

```typescript
// Produk akan tampilkan harga:
const displayPrice = computed(() => {
  if (product.price_override) {
    return product.price; // Manual price
  }
  // Auto-calculated
  return product.weight_grams * goldPrice[product.karat];
});
```

### Database Trigger:

- Auto-log ke `gold_price_history` saat update harga
- Tracking: old_price, new_price, changed_by, timestamp

---

## ✅ Testing Checklist

- [ ] Update harga 18K di Gold Price Manager
- [ ] Verify history tercatat
- [ ] Tambah produk baru dengan auto-price
- [ ] Tambah produk dengan override manual
- [ ] Recalculate bulk → verify produk non-override terupdate
- [ ] Verify produk override TIDAK berubah
- [ ] Check frontend display harga

---

## 🚀 Benefits

1. **Efisien**: Update 1× → ratusan produk terupdate
2. **Akurat**: Harga always sync dengan gold price
3. **Fleksibel**: Override untuk special pricing
4. **Transparent**: History tracking lengkap
5. **Scalable**: Mudah tambah kadar baru

---

## 📌 Notes

- Default prices: 8K=450k, 9K=500k, 16K=850k, 17K=900k, 18K=950k, 22K=1.15jt
- Weight harus dalam gram (numeric)
- Recalculate hanya affect produk non-override
- History unlimited (bisa add retention policy nanti)

---

**Status**: ✅ Ready to Deploy
**Last Updated**: 2025-10-31
