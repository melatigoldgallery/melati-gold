# Cache Audit – Optimasi Cloudinary Free Tier

> Analisis mendalam penggunaan cache saat ini dan celah yang perlu diperbaiki  
> untuk memaksimalkan free tier Cloudinary (25 GB bandwidth / 25.000 transformasi / bulan).

---

## Status Keseluruhan

| Layer Cache                                | Status             | Keterangan                                          |
| ------------------------------------------ | ------------------ | --------------------------------------------------- |
| **Data cache** (Supabase)                  | ✅ Berjalan        | `useCacheManager` + `fetchWithCache`                |
| **Image transform cache** (Cloudinary CDN) | ⚠️ Sebagian        | `f_auto`, `q_auto` sudah ada, `srcset` belum merata |
| **Browser HTTP cache**                     | ❌ Tidak dikontrol | Tidak ada `Cache-Control` headers eksplisit         |
| **Preload LCP image**                      | ❌ Absen           | Tidak ada `<link rel="preload">` untuk gambar utama |

---

## A. Data Cache (`useCacheManager`)

### ✅ Yang sudah benar

- Strategi **Cache-First** dengan dual-layer: `memoryCache` (runtime Map) → `localStorage` (persisten).
- `fetchWithCache` dipakai konsisten di `useCatalogManager` untuk categories, subcategories, products.
- Invalidasi cache (`clearPrefix`) dipanggil setelah setiap operasi CRUD.

### ❌ Masalah & Risiko

| #   | Masalah                                                | Dampak                                                                                        |
| --- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1   | **TTL terlalu pendek** – default 5 mnt, catalog 10 mnt | Data produk jewelry jarang berubah; setiap kunjungan baru memicu refetch Supabase tidak perlu |
| 2   | **Tidak ada batas ukuran** `memoryCache` Map           | Tumbuh tak terbatas selama sesi; pada katalog besar bisa makan RAM                            |
| 3   | **`clearAll()` memangkas seluruh localStorage**        | Jika dipanggil tidak sengaja, semua cache hilang termasuk data sesi lain                      |
| 4   | **Tidak ada stale-while-revalidate**                   | User selalu menunggu fetch baru setelah TTL habis, UX terputus                                |
| 5   | **Tidak ada deduplication concurrent request**         | Jika 2 komponen load bersamaan sebelum cache terisi, keduanya akan fetch ke Supabase          |

### Rekomendasi Perbaikan Data Cache

```typescript
// 1. Naikkan TTL untuk data yang jarang berubah
{
  ttl: 60 * 60 * 1000;
} // 60 menit untuk categories/subcategories

// 2. Batasi ukuran memoryCache
const MAX_MEMORY_ENTRIES = 100;
if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
  const firstKey = memoryCache.keys().next().value;
  memoryCache.delete(firstKey); // LRU sederhana
}

// 3. Tandai entry sebagai stale, revalidate di background
const isStale = (entry) => Date.now() - entry.timestamp > entry.revalidateAfter;
// Kembalikan data lama, fetch baru di background

// 4. In-flight deduplication
const inflight = new Map<string, Promise<any>>();
if (inflight.has(key)) return inflight.get(key);
const promise = fetchFn();
inflight.set(key, promise);
promise.finally(() => inflight.delete(key));
```

---

## B. Image Optimization Cache (Cloudinary CDN)

### Mekanisme Cache Cloudinary

Cloudinary **otomatis cache** setiap URL transformasi di CDN-nya.  
Setelah pertama kali di-generate, **bandwidth TIDAK dihitung ulang** selama URL sama.  
Ini adalah lapisan cache terpenting untuk free tier.

### ✅ Yang sudah benar

- `f_auto` – serve WebP/AVIF sesuai browser → hemat 25–35% per gambar.
- `q_auto` – kompresi cerdas per-gambar, lebih efisien dari `q_90` fixed.
- `srcset` sudah diimplementasikan di: `ProductGrid.vue`, `FeaturedProducts.vue`, `ProductGallery.vue`.
- `loading="lazy"` sudah ada di komponen-komponen utama.

### ❌ Masalah & Celah

| #   | File                                                    | Masalah                                                                                        | Dampak                                                                    |
| --- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | `RelatedProducts.vue`                                   | Inline transform `w_400,h_500` tanpa `srcset`, tidak pakai `useImageOptimization`              | Mobile download gambar 2–3× lebih besar, +1 transformasi unik tiap ukuran |
| 2   | `generateSrcSet` default                                | Meng-generate 3 URL per gambar (3 transformasi × N produk)                                     | Boros transformasi quota jika ada banyak produk baru                      |
| 3   | `preset.gallery` = 800×800, `preset.detail` = 1000×1000 | Terlalu besar untuk mobile (max display ~390px)                                                | Bandwidth terbuang di perangkat mobile                                    |
| 4   | Tidak ada `sizes` attribute yang benar                  | Browser asumsi `100vw` → bisa download gambar lebih besar dari yang diperlukan                 | Pemborosan bandwidth pada gambar grid multi-kolom                         |
| 5   | Tidak ada `<link rel="preload">` untuk LCP              | Gambar pertama (hero/featured) dimuat lambat tidak dianggap prioritas oleh browser             | Tidak langsung mempengaruhi bandwidth tapi mempengaruhi Core Web Vitals   |
| 6   | `public_id` pakai `Date.now()` saat upload              | URL tidak deterministik; tidak bisa overwrite → tiap re-upload = file baru + transformasi baru | Storage penuh dengan versi lama jika tidak ada cleanup                    |

### Estimasi Transformasi Per Bulan

```
Produk baru/bulan: ~20 produk × 3 gambar = 60 gambar
Transformasi per gambar (srcset 3 sizes): ×3
= 180 transformasi/upload

Pengunjung unik: ~500/bulan
Gambar grid per halaman: ~20 gambar
Jika URL tidak pernah di-cache browser: 500 × 20 = 10.000 hit CDN
→ Cloudinary CDN yang cache, bandwidth hanya dihitung saat transformasi belum ada di CDN
```

### Rekomendasi Perbaikan Image Optimization

#### 1. Perbaiki `RelatedProducts.vue`

```vue
<script setup>
// SEBELUM (inline)
const optimizeImage = (url) => url.replace("/upload/", "/upload/w_400,h_500,c_fill,f_auto,q_auto/");

// SESUDAH (pakai composable + srcset)
const { presets, generateSrcSet } = useImageOptimization();
const getImage = (url) => presets.card(url);
const getSrcSet = (url) => (url?.includes("cloudinary.com") ? generateSrcSet(url, [200, 400]) : undefined);
</script>

<template>
  <img
    :src="getImage(product.thumbnail_image)"
    :srcset="getSrcSet(product.thumbnail_image)"
    sizes="(max-width: 640px) 50vw, 33vw"
    loading="lazy"
    decoding="async"
  />
</template>
```

#### 2. Sesuaikan preset ukuran di `useImageOptimization.ts`

```typescript
// Kurangi ukuran preset untuk hemat bandwidth mobile
const presets = {
  thumbnail: (url) => getOptimizedUrl(url, { width: 150, height: 150 }), // dari 200×200
  card: (url) => getOptimizedUrl(url, { width: 300, height: 300 }), // dari 400×400
  gallery: (url) => getOptimizedUrl(url, { width: 600, height: 600 }), // dari 800×800
  detail: (url) => getOptimizedUrl(url, { width: 800, height: 800 }), // dari 1000×1000
};
```

#### 3. Tambahkan `sizes` attribute yang tepat

```vue
<!-- Grid 2 kolom mobile, 3 kolom tablet, 4 kolom desktop -->
<img sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" ... />

<!-- Related products carousel -->
<img sizes="(max-width: 640px) 50vw, 33vw" ... />
```

#### 4. Preload gambar LCP

```vue
<!-- di layouts/default.vue atau pages/index.vue -->
<Head>
  <Link
    rel="preload"
    as="image"
    :href="presets.hero(featuredProduct.thumbnail_image)"
    fetchpriority="high"
  />
</Head>
```

---

## C. Monitoring Free Tier

### ❌ Tidak Ada Peringatan Dini

Saat ini tidak ada mekanisme untuk memantau penggunaan mendekati batas.

### Rekomendasi

```typescript
// Panggil /api/cloudinary/usage (sudah ada) secara periodik
// Tampilkan alert di admin dashboard jika melebihi 80%

const { data } = await getUsage();
if (data.bandwidth.usage_percent > 80) {
  console.warn("[Cloudinary] Bandwidth usage > 80%!");
}
```

---

## Prioritas Perbaikan

| Prioritas | Aksi                                                        | Estimasi Penghematan                           |
| --------- | ----------------------------------------------------------- | ---------------------------------------------- |
| 🔴 HIGH   | Perbaiki `RelatedProducts.vue` – tambah srcset + composable | ~2× bandwidth mobile untuk related products    |
| 🔴 HIGH   | Tambah `sizes` attribute di semua `<img>` Cloudinary        | ~20–40% bandwidth dengan browser sizing tepat  |
| 🟡 MEDIUM | Naikkan TTL `useCacheManager` ke 30–60 mnt untuk catalog    | Kurangi Supabase API calls ~6×                 |
| 🟡 MEDIUM | Perkecil preset `gallery` dan `detail`                      | ~20% bandwidth di halaman detail produk        |
| 🟡 MEDIUM | Tambah in-flight deduplication di `fetchWithCache`          | Cegah double-fetch saat mount concurrent       |
| 🟢 LOW    | Tambah `<link rel="preload">` untuk LCP image               | Tidak hemat bandwidth, tapi perbaiki LCP score |
| 🟢 LOW    | Batas ukuran `memoryCache` (max 100 entries)                | Cegah memory leak jangka panjang               |
| 🟢 LOW    | Monitoring usage di admin dashboard                         | Deteksi dini sebelum limit tercapai            |
