# Cloudinary Free Tier Optimization Plan

> **Tujuan:** Menekan penggunaan bandwidth & transformasi Cloudinary agar tidak cepat mencapai limit free tier (25 credits/bulan), meskipun diakses banyak device.

---

## Cloudinary Free Tier Limits

| Resource            | Limit        |
| ------------------- | ------------ |
| **Bandwidth**       | 25 GB/bulan  |
| **Storage**         | 25 GB total  |
| **Transformations** | 25.000/bulan |

Catatan: **Bandwidth adalah bottleneck utama** di website e-commerce dengan banyak gambar produk.

---

## Audit Masalah Saat Ini

### ❌ Masalah 1: Duplikasi Fungsi Optimasi (Prioritas: High)

**File terdampak:** `FeaturedProducts.vue`, `ProductGrid.vue`, `ProductGallery.vue`

Setiap komponen mendefinisikan ulang `optimizeCloudinaryImage()` secara inline, **mengabaikan** composable `useImageOptimization.ts` yang sudah ada dan lebih lengkap (memiliki `generateSrcSet`).

```typescript
// ❌ SAAT INI: Inline duplikat di tiap komponen
const optimizeCloudinaryImage = (url, width, height, quality) => { ... }

// ✅ SEHARUSNYA: Pakai composable yang sudah ada
const { presets, generateSrcSet } = useImageOptimization();
```

---

### ❌ Masalah 2: Tidak Ada Responsive Images / srcset (Prioritas: CRITICAL)

**Dampak: Terbesar terhadap bandwidth**

Saat ini semua device (HP 390px ↔ Desktop 1920px) men-download gambar berukuran **sama**. Tidak ada `srcset` atau `sizes` attribute.

- `ProductGrid.vue`: Semua device download `600×600px` → HP hanya butuh `~200×200px`
- `FeaturedProducts.vue`: Semua device download `400×400px` → HP hanya butuh `~190×190px`

**Estimasi penghematan:** Gambar grid di mobile bisa 4–9× lebih kecil dengan srcset yang benar.

---

### ❌ Masalah 3: Ukuran Gambar Berlebih untuk Mobile (Prioritas: High)

| Komponen               | Ukuran Saat Ini | Layar Mobile (2 col) | Pemborosan        |
| ---------------------- | --------------- | -------------------- | ----------------- |
| `ProductGrid`          | 600×600         | ~190px               | ~3× lebih besar   |
| `FeaturedProducts`     | 400×400         | ~190px               | ~2× lebih besar   |
| `ProductGallery` large | 1000×1000       | ~390px               | ~2.5× lebih besar |

---

### ❌ Masalah 4: quality: 90 di ProductGallery (Prioritas: Medium)

`q_90` (fixed) pada gambar detail lebih boros dibanding `q_auto` milik Cloudinary yang sudah cerdas mengoptimasi per-gambar.

---

### ✅ Sudah Benar (Jangan Diubah)

- `f_auto` → Cloudinary otomatis serve WebP/AVIF (hemat 25–35%)
- `q_auto` → sebagian besar sudah digunakan
- `loading="lazy"` → sebagian besar sudah ada
- `decoding="async"` → sudah ada di beberapa komponen

---

## Rencana Perbaikan

### Perbaikan 1: Gunakan `useImageOptimization` + srcset di ProductGrid

```vue
<!-- ProductGrid.vue -->
<script setup>
const { generateSrcSet, presets } = useImageOptimization();
</script>

<template>
  <img
    :src="presets.card(product.thumbnail_image)"
    :srcset="generateSrcSet(product.thumbnail_image, [200, 400, 600])"
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    loading="lazy"
    decoding="async"
  />
</template>
```

### Perbaikan 2: Ubah ukuran preset untuk grid cards

Perbarui `useImageOptimization.ts`:

```typescript
// Untuk grid product card - mobile-first
card: (url) => getOptimizedUrl(url, {
  width: 400, // Turun dari 600 → max display ~390px
  height: 400,
  quality: 'auto',
  format: 'auto',
  crop: 'fill',
  gravity: 'auto', // Smart crop fokus ke subjek
}),

// Thumbnail kecil (strip)
thumbnail: (url) => getOptimizedUrl(url, {
  width: 200, // Turun dari 400 → strip thumbnail hanya ~80px
  height: 200,
  quality: 'auto',
  format: 'auto',
  crop: 'fill',
}),
```

### Perbaikan 3: Responsive images di ProductGallery

```vue
<!-- ProductGallery.vue - gambar utama -->
<img
  :src="optimizeImage(currentImage, 'large')"
  :srcset="generateSrcSet(currentImage, [400, 700, 1000])"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
  loading="eager"
/>

<!-- Thumbnail strip -->
<img
  :src="optimizeImage(item.url, 'thumbnail')"
  :srcset="generateSrcSet(item.url, [80, 160])"
  sizes="80px"
  loading="lazy"
/>
```

### Perbaikan 4: Ganti `quality: 90` → `quality: 'auto'` di ProductGallery

```typescript
// ❌ Saat ini
"w_1000,h_1000,c_fill,f_auto,q_90";

// ✅ Seharusnya
"w_1000,h_1000,c_fill,f_auto,q_auto";
```

### Perbaikan 5: Upload Preset — Tambahkan Eager Transformations

Di **Cloudinary Dashboard → Upload Presets**, tambahkan eager transformations agar hasil transformasi di-cache saat upload, bukan saat pertama kali diakses:

```
Eager transformations:
- w_400,h_400,c_fill,f_auto,q_auto    (card)
- w_200,h_200,c_fill,f_auto,q_auto    (thumbnail)
- w_1000,h_1000,c_fill,f_auto,q_auto  (detail)
```

---

## Estimasi Penghematan Bandwidth

Asumsi: 100 pengunjung/hari, masing-masing lihat 10 produk

| Skenario                    | Ukuran/gambar         | Total/hari |
| --------------------------- | --------------------- | ---------- |
| Sebelum (mobile, no srcset) | ~80 KB (600×600 WebP) | ~80 MB     |
| Sesudah (mobile + srcset)   | ~12 KB (200×200 WebP) | ~12 MB     |
| **Penghematan**             |                       | **~85%**   |

> Dengan 25 GB/bulan limit = bisa handle ~750 GB download / 25 GB = free tier cukup untuk **±2.000 pengunjung/hari** dengan implementasi yang benar.

---

## Prioritas Implementasi

| #   | Perbaikan                                | Dampak Bandwidth         | Effort |
| --- | ---------------------------------------- | ------------------------ | ------ |
| 1   | Tambah `srcset` + `sizes` di ProductGrid | ⭐⭐⭐⭐⭐               | Medium |
| 2   | Kurangi ukuran preset `card` 600→400     | ⭐⭐⭐⭐                 | Low    |
| 3   | Tambah `srcset` di FeaturedProducts      | ⭐⭐⭐⭐                 | Medium |
| 4   | Ganti `q_90` → `q_auto` di Gallery       | ⭐⭐⭐                   | Low    |
| 5   | Hapus inline duplicate, pakai composable | ⭐⭐ (maintainability)   | Medium |
| 6   | Eager transforms di upload preset        | ⭐⭐⭐ (transformations) | Low    |

---

## Checklist Sebelum Deploy

- [ ] Semua `<img>` Cloudinary menggunakan `f_auto` dan `q_auto`
- [ ] Semua `<img>` memiliki `loading="lazy"` (kecuali above-the-fold)
- [ ] Semua grid/thumbnail menggunakan `srcset` + `sizes`
- [ ] Upload preset sudah dikonfigurasi eager transformations
- [ ] Tidak ada inline duplicate optimizeImage di komponen
- [ ] Monitor usage: `/api/cloudinary/usage` endpoint sudah tersedia

---

_Dibuat: Februari 2026_
